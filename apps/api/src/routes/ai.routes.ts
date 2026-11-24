import { Router } from "express";
import { aiController } from "../controllers/ai.controller";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";

const router = Router();

router.use(requireAuth);
router.use(requireRole("agent", "admin"));

router.post("/tickets/:id/suggest-reply", aiController.suggestReply);
router.post("/tickets/:id/categorise", aiController.categorise);

export default router;
