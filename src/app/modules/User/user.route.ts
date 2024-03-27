import express, { NextFunction, Request, Response } from "express";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../utils/fileUploader";
import { userValidations } from "./user.validation";
import { json } from "stream/consumers";

const router = express.Router();
          



router.post("/create-admin", auth(UserRole.SUPER_ADMIN,UserRole.ADMIN),
fileUploader.upload.single('file'),
(req:Request, res: Response,next :NextFunction)=>{
req.body = userValidations.createAdmin.parse(JSON.parse(req.body.data))
return userController.createAdmin(req,res,next)
},
);
router.post("/create-doctor", auth(UserRole.SUPER_ADMIN,UserRole.ADMIN),
fileUploader.upload.single('file'),
(req:Request, res: Response,next :NextFunction)=>{
req.body = userValidations.createDoctor.parse(JSON.parse(req.body.data))
return userController.createDoctor(req,res,next)
},
);
router.post("/create-patient",
fileUploader.upload.single('file'),
(req:Request, res: Response,next :NextFunction)=>{
req.body = userValidations.createPatient.parse(JSON.parse(req.body.data))
return userController.createPatient(req,res,next)
},
);
export const UserRoutes = router;
