import { Router } from "express";
import {
  getAllUsers,
  getUser,
  login,
  signup,
  getMe,
  updateProfile,
  logout,
} from "./user.controller.js";
import { validateLogin, validateSignup, validateUpdateProfile } from "./user.validation.js";
import { protect, restrictTo } from "../../middleware/auth.js";

const UserRouter = Router();

UserRouter.post("/signup", validateSignup, signup);
UserRouter.post("/login", validateLogin, login);

UserRouter.use(protect);

UserRouter.post("/logout", logout);
UserRouter.get("/profile", getMe);
UserRouter.put("/profile", validateUpdateProfile, updateProfile);
UserRouter.get("/all-users", restrictTo("teacher"), getAllUsers);
UserRouter.get("/:id", restrictTo("teacher"), getUser);

export default UserRouter;
