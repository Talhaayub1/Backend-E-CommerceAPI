import express from "express";

const router = express.Router();

import {
  getAllOrders,
  createOrder,
  getSingleOrder,
  updateOrder,
  getCurrentUserOrder,
} from "../controllers/orderController.js";
import {
  isAuthenticatedUser,
  authorizedPermissions,
} from "../middleware/authentication.js";
router
  .route("/")
  .post(isAuthenticatedUser, createOrder)
  .get(isAuthenticatedUser, authorizedPermissions("admin"), getAllOrders);

router.route("/showAllMyOrders").get(isAuthenticatedUser, getCurrentUserOrder);

router
  .route("/:id")
  .get(isAuthenticatedUser, getSingleOrder)
  .patch(isAuthenticatedUser, updateOrder);

export default router;
