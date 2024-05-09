import { User } from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} from "../errors/index.js";
import { createTokenUser } from "../utils/createTokenUser.js";
import { cookieResponse } from "../utils/jwtToken.js";
import { checkPermission } from "../utils/index.js";

const getAllUser = async (req, res) => {
  // console.log(req.user);
  try {
    const users = await User.findOne({ role: "user" }).select("-password");
    res.status(StatusCodes.OK).json({ users });
  } catch (error) {
    console.error(error.message);
  }
};

const getSingleUser = async (req, res) => {
  const user = await User.findById({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new NotFoundError("User not found");
  }
  // Call checkPermission to ensure the user making the request has permission to access the user data,
  // This ensures that the user is authorized to access the requested user data before sending it in the response.
  checkPermission(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    throw new BadRequestError("Email and name are required");
  }

  // const user = await User.findOneAndUpdate(
  //   { _id: req.user.userId },
  //   { email, name },
  //   { new: true, runValidators: true }
  // );

  const user = await User.findOne({ _id: req.user.userId });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);
  cookieResponse({ res, user: tokenUser });

  res
    .status(StatusCodes.OK)
    .json({ message: "Success! User Updation successfully", user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Password is required");
  }

  const user = await User.findOne({
    _id: req.user.userId,
  });

  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("password is incorrect");
  }

  user.password = newPassword;

  await user.save();
  res
    .status(StatusCodes.OK)
    .json({ message: "Success! Password updated successfully" });
};

export {
  getAllUser,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
