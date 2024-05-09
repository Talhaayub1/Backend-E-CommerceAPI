import express from "express";
const router = express.Router();

import {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} from "../controllers/productController.js";
import {
  authorizedPermissions,
  isAuthenticatedUser,
} from "../middleware/authentication.js";

import { getSingleProductReviews } from "../controllers/reviewController.js";

router
  .route("/")
  .post([isAuthenticatedUser, authorizedPermissions("admin")], createProduct)
  .get(getAllProducts);

router.route("/uploadImage").post(uploadImage);

router
  .route("/:id")
  .get(getSingleProduct)
  .patch([isAuthenticatedUser, authorizedPermissions("admin")], updateProduct)
  .delete([isAuthenticatedUser, authorizedPermissions("admin")], deleteProduct);
router.route("/:id/reviews").get(getSingleProductReviews);
export default router;
