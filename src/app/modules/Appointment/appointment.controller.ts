import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AppointmentService } from "./appointment.service";
import { TAuthUser } from "../../interface/interface";

const createAppointment = catchAsync(async (req: Request &{user?:TAuthUser} , res: Response) => {
    const user = req.user
  const result = await AppointmentService.createAppointmentIntoDB(user as TAuthUser,req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointment created successfully",

    data: result,
  });
});
export const AppointmentController = { createAppointment };
