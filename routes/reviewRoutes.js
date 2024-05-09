import express from "express";
const router = express.Router();

import {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { isAuthenticatedUser } from "../middleware/authentication.js";

router.route("/").post(isAuthenticatedUser, createReview).get(getAllReviews);
router
  .route("/:id")
  .get(getSingleReview)
  .patch(isAuthenticatedUser, updateReview)
  .delete(isAuthenticatedUser, deleteReview);

export default router;
