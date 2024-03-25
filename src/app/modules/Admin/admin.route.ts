import express from "express";
import { AdminControllers } from "./admin.controller";
import validateRequest from "../../middlewares/validateRequest";
import { AdminValidations } from "./admin.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminControllers.getAdmins
);
router.get("/:id", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), AdminControllers.getSingleAdmin);
router.patch(
  "/:id", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(AdminValidations.updateAdmin),
  AdminControllers.updateSingleAdmin
);
router.delete("/:id", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), AdminControllers.deleteSingleAdmin);

export const AdminRoutes = router;
