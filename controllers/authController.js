import { User } from "../models/User.js";
import { StatusCodes } from "http-status-codes";
// import BadRequestError from "../errors/Bad-Request.js";
import { BadRequestError, UnauthenticatedError } from "../errors/index.js";

import { cookieResponse, createTokenUser } from "../utils/index.js";

const registerUser = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email: email });
  if (emailAlreadyExists) {
    throw new BadRequestError("Email already in Exist");
  }

  const isFirstUser = (await User.countDocuments({})) === 0;
  const role = isFirstUser ? "admin" : "user";

  const user = await User.create({ name, password, email, role });
  const tokenUser = createTokenUser(user);
  cookieResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).send({ user });
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("User is not authenticated");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("User is not authenticated");
  }

  const tokenUser = createTokenUser(user);
  cookieResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).send({ user: tokenUser });
};
const logoutUser = async (req, res) => {
  // res.send("logout user");
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).send({ message: "User logged out successfully" });
};

export { registerUser, loginUser, logoutUser };
