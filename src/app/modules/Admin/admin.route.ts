import express from "express";
import { AdminControllers } from "./admin.controller";
import validateRequest from "../../middlewares/validateRequest";
import { AdminValidations } from "./admin.validation";
const router = express.Router();




router.get("/", AdminControllers.getAdmins);
router.get("/:id", AdminControllers.getSingleAdmin);
router.patch(
  "/:id",
  validateRequest(AdminValidations.updateAdmin),
  AdminControllers.updateSingleAdmin
);
router.delete("/:id", AdminControllers.deleteSingleAdmin);

export const AdminRoutes = router;
