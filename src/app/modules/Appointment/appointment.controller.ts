import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AppointmentService } from "./appointment.service";
import { TAuthUser } from "../../interface/interface";
import pick from "../../utils/pick";
import { appointmentFilterableFields } from "./appointment.constant";
import { stat } from "fs";

const createAppointment = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;
    const result = await AppointmentService.createAppointmentIntoDB(
      user as TAuthUser,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Appointment created successfully",

      data: result,
    });
  }
);

const getMyAppointment = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;
    const filters = pick(req.query, ["status", "paymentStatus"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await AppointmentService.getMyAppointmentFromDB(
      user as TAuthUser,
      filters,
      options
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Appointment retrived successfully",
      meta: result?.meta,
      data: result?.data,
    });
  }
);
const getAllAppointment = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, appointmentFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await AppointmentService.getAllAppointmentFromDB(
    filters,
    options
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointment retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});
const changeAppointmentStatus = catchAsync(
  async (req: Request & {user? : TAuthUser}, res: Response) => {
    const {appointmentId}= req.params
    const {status} = req.body
    const user =req.user
    const result = await AppointmentService.changeAppointmentStatusIntoDB(appointmentId,status,user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Appointment status changed successfully",

      data: result,
    });
  }
);

export const AppointmentController = {
  changeAppointmentStatus,
  createAppointment,
  getMyAppointment,
  getAllAppointment,
};
