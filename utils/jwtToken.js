import jwt from "jsonwebtoken"; // Importing JWT library
import UnauthenticatedError from "../errors/unauthenticated.js"; // Importing custom error class

// Function to create a JWT token based on provided payload
export const createJWT = ({ payload }) => {
  try {
    // Generate JWT token with payload, secret key, and expiration time
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    // If token creation fails, throw an UnauthenticatedError
    if (!token) {
      throw new UnauthenticatedError("Failed to create JWT");
    }

    return token; // Return generated token
  } catch (error) {
    // If an error occurs during token creation, throw an UnauthenticatedError with the error message
    throw new UnauthenticatedError("Failed to create JWT", error.message);
  }
};

// Function to verify and decode a JWT token
export const isJWTTokenValid = ({ token }) => {
  try {
    // Verify and decode the JWT token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If decoding fails (decoded is falsy), throw an UnauthenticatedError indicating invalid JWT signature
    if (!decoded) {
      throw new UnauthenticatedError("Invalid JWT signature");
    }

    return decoded; // Return decoded payload if token is valid
  } catch (error) {
    // If an error occurs during token verification, throw an UnauthenticatedError with the error message
    throw new UnauthenticatedError("Token is invalid", error.message);
  }
};

// Function to set JWT token in a cookie and send it back to the client as part of the response
export const cookieResponse = ({ res, user }) => {
  const token = createJWT({ payload: user }); // Generate JWT token for user payload

  // Set the JWT token in a cookie named "token" in the response
  res.cookie("token", token, {
    httpOnly: true, // Make the cookie accessible only via HTTP(S) requests
    secure: process.env.NODE_ENV === "production", // Set cookie as secure if in production environment
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // Set cookie expiration time (24 hours)
    signed: true, // Sign the cookie for added security
  });

  res.status(201).send({ user }); // Send a success response along with the user data
};
