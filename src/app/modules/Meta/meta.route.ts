import express from "express";
import { MetaController } from "./meta.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  MetaController.getDashboardMetaData
);

export const MetaRoutes = router;
