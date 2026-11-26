import { Router } from "express";
import { usersController } from "../controllers/users.controller";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";

const router = Router();

router.use(requireAuth);
router.get(
  "/customers",
  requireRole("agent", "admin"),
  usersController.listCustomers
);
router.get(
  "/admins",
  requireRole("agent", "admin"),
  usersController.listAdmins
);

export default router;
