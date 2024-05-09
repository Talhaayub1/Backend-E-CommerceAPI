import Review from "../models/Review.js";
import Product from "../models/Product.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from "../errors/index.js";
import { StatusCodes } from "http-status-codes";

import { checkPermission } from "../utils/index.js";

// Define the createReview function
const createReview = async (req, res) => {
  // Extract the product ID from the request body
  const { product: productId } = req.body;

  // Check if the product exists
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    // If product not found, throw a NotFoundError
    throw new NotFoundError(`Product is not available with id ${productId}`);
  }

  // Check if the user has already submitted a review for the product
  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (alreadySubmitted) {
    // If user has already submitted a review, throw a BadRequestError
    throw new BadRequestError(
      "You have already submitted a review for this product"
    );
  }

  // Set the user ID in the request body
  req.body.user = req.user.userId;

  // Create a new review
  const review = await Review.create(req.body);

  // Send response with the newly created review
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate({
      path: "product",
      select: "name company price",
    })
    .populate({
      path: "user",
      select: "name company",
    });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new NotFoundError(`Review with id ${reviewId} not found`);
  }

  res.status(StatusCodes.OK).json({ review });
};
const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const ifreviewExisted = await Review.findOne({ _id: reviewId });
  if (!ifreviewExisted) {
    throw new NotFoundError(`Review with id ${reviewId} not found`);
  }

  checkPermission(req.user, ifreviewExisted.user);

  ifreviewExisted.rating = rating;
  ifreviewExisted.title = title;
  ifreviewExisted.comment = comment;

  await ifreviewExisted.save();
  res
    .status(StatusCodes.OK)
    .json({ msg: `Success! Review was Update Successfully` });
};
const deleteReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;
    const deletereview = await Review.findOneAndDelete({ _id: reviewId });

    if (!deletereview) {
      throw new NotFoundError(`Review with id ${reviewId} not found`);
    }
    checkPermission(req.user, deleteReview.user);
    await deletereview.remove();
    res.status(StatusCodes.OK).json({ msg: "Review deleted successfully" });
  } catch (error) {
    console.error(error.message);
  }
};

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.send(StatusCodes.OK).json({ reviews, count: reviews.length });
};

export {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
