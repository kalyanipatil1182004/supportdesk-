import { Router } from "express";
import { aiController } from "../controllers/ai.controller";
import { aiRateLimit } from "../middlewares/ai-rate-limit";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";

const router = Router();

router.use(requireAuth);
router.use(requireRole("agent", "admin"));

router.post(
  "/tickets/:id/suggest-reply",
  aiRateLimit,
  aiController.suggestReply
);
router.post(
  "/tickets/:id/categorise",
  aiRateLimit,
  aiController.categorise
);

export default router;
