import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { PrescriptionService } from "./prescription.service";
import { TAuthUser } from "../../interface/interface";

const createPrescription = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;
    const result = await PrescriptionService.createPrescriptionIntoDB(
      req.body,
      user as TAuthUser
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Prescription created successfully!",
      data: result,
    });
  }
);
export const PrescriptionController = { createPrescription };
