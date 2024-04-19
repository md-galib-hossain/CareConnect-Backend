import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { PrescriptionService } from "./prescription.service";
import { TAuthUser } from "../../interface/interface";
import pick from "../../utils/pick";

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
const getMyPrescription = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const user = req.user;
    const result = await PrescriptionService.getMyPrescriptionFromDB(
      user as TAuthUser,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Prescription retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);
export const PrescriptionController = { createPrescription, getMyPrescription };
