import express from "express";
const router = express.Router();
import {
  isAuthenticatedUser,
  authorizedPermissions,
} from "../middleware/authentication.js";
import {
  getAllUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  getSingleUser,
} from "../controllers/userController.js";

router
  .route("/")
  .get(isAuthenticatedUser, authorizedPermissions("admin", "user"), getAllUser);
router.route("/showMe").get(isAuthenticatedUser, showCurrentUser);
router.route("/updateUser").patch(isAuthenticatedUser, updateUser);
router.route("/updatePassword").patch(isAuthenticatedUser, updateUserPassword);
router.route("/:id").get(isAuthenticatedUser, getSingleUser);
export default router;
