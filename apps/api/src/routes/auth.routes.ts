import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { loginRateLimit } from "../middlewares/login-rate-limit";

const router = Router();

router.post("/register", authController.register);
router.post("/login", loginRateLimit, authController.login);

export default router;