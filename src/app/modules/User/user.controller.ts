import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import catchAsync from "../../utils/catchAsync";

const createAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.createAdminIntoDB(req);
    res.status(200).send({
      success: true,
      message: "Admin created successfully",
      data: result,
    });
  }
);
const createDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.createDoctorIntoDB(req);
    res.status(200).send({
      success: true,
      message: "Doctor created successfully",
      data: result,
    });
  }
);
const createPatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.createPatientIntoDB(req);
    res.status(200).send({
      success: true,
      message: "Patient created successfully",
      data: result,
    });
  }
);

export const userController = { createAdmin, createDoctor, createPatient };
