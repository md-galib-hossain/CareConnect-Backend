import express, { NextFunction, Request, Response } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { SpecialtiesController } from "./specialties.controller";
import { fileUploader } from "../../utils/fileUploader";
import { SpecialtiesValidation } from "./specialties.validation";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SpecialtiesValidation.createSpecialtiesValidation.parse(
      JSON.parse(req.body.data)
    );
    return SpecialtiesController.createSpecialties(req, res, next);
  }
); 
router.get("/", SpecialtiesController.getAllSpecialties);
router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SpecialtiesController.deleteSpecialties
);
export const SpecialtiesRoutes = router;
