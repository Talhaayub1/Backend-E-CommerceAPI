import {
  UnauthenticatedError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/index.js"; // Importing custom error classes
import { isJWTTokenValid } from "../utils/index.js"; // Importing utility function to validate JWT token

// Middleware to authenticate user based on JWT token
export const isAuthenticatedUser = async (req, res, next) => {
  const token = req.signedCookies.token; // Extract JWT token from signed cookie

  // If token doesn't exist, throw UnauthenticatedError
  if (!token) {
    throw new UnauthenticatedError("Authentication Invalid!");
  }

  try {
    const decodedToken = await isJWTTokenValid({ token }); // Validate and decode JWT token
    // If token is invalid (decodedToken is falsy), throw UnauthenticatedError
    if (!decodedToken) {
      throw new UnauthenticatedError("Invalid token!, try again");
    }

    // If token is valid, extract user information from decoded token and attach it to req.user
    req.user = {
      name: decodedToken.name,
      userId: decodedToken.userId,
      role: decodedToken.role,
    };
    next(); // Move to next middleware or route handler
  } catch (error) {
    // If an error occurs during authentication, throw UnauthenticatedError with the error message
    throw new UnauthenticatedError(
      "Error While Authentication ",
      error.message
    );
  }
};

// Middleware to restrict access based on user roles
export const authorizedPermissions = (...roles) => {
  return (req, res, next) => {
    // Check if user's role is included in the list of allowed roles
    if (!roles.includes(req.user.role)) {
      // If user's role is not allowed, throw UnauthorizedError
      throw new UnauthorizedError(
        "You are not authorized to access this route"
      );
    }
    next(); // Move to next middleware or route handler if user is authorized
  };
};
