import { Router } from "express";
import { commentsController } from "../controllers/comments.controller";
import { ticketsController } from "../controllers/tickets.controller";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";

const router = Router();

router.use(requireAuth);
router.use(requireRole("customer", "agent", "admin"));

router.get("/", ticketsController.getAll);
router.get("/:id", ticketsController.getById);
router.post("/", ticketsController.create);
router.patch("/:id", ticketsController.update);
router.get("/:ticketId/comments", commentsController.list);
router.post("/:ticketId/comments", commentsController.create);

export default router;