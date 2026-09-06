import { Router } from "express";
import { requireAuth, requireRole } from "../../common/middleware/auth.js";
import {
  listUsersHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  registerHandler,
  updateProfileHandler,
  updateUserRoleHandler,
} from "./auth.controller.js";

export const authRoutes = Router();

authRoutes.post("/register", registerHandler);
authRoutes.post("/login", loginHandler);
authRoutes.post("/logout", logoutHandler);
authRoutes.get("/me", meHandler);
authRoutes.patch("/profile", requireAuth, updateProfileHandler);

/**
 * Managing who may do what is an admin power, not a staff one. Staff fulfil
 * orders; only an admin changes the shape of the team.
 */
export const userRoutes = Router();

userRoutes.get("/", requireRole("admin"), listUsersHandler);
userRoutes.patch("/:id/role", requireRole("admin"), updateUserRoleHandler);
