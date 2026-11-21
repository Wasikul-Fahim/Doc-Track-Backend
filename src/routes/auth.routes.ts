import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimit";
import { validate } from "../middleware/validate";
import { loginSchema } from "../validators/auth.validator";

const router = Router();

router.post(
  "/login",
  authRateLimiter,
  validate({ body: loginSchema }),
  authController.login
);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

export default router;
