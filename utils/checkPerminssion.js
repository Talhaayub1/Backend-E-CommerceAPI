import { UnauthorizedError } from "../errors/index.js";

export const checkPermission = (requestUser, resourseUserId) => {
  // Check if the request user has an "admin" role, grant them permission directly
  if (requestUser.role === "admin") return;

  // Check if the request user ID matches the ID of the resource being accessed, grant access if these conditions are met
  if (requestUser.userId === resourseUserId.toString()) return;

  // If neither condition is met, throw an UnauthorizedError
  throw new UnauthorizedError("You are not authorized to perform this action");
};
