import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { TAuthUser } from "../../interface/interface";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { DoctorScheduleService } from "./doctorSchedule.service";

const createDoctorSchedule = catchAsync(async (req: Request & { user?: TAuthUser }, res: Response) => {

    const user = req.user;
    const result = await DoctorScheduleService.createDoctorScheduleIntoDB(user, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctor Schedule created successfully!",
        data: result
    });
});

export const DoctorScheduleController = {createDoctorSchedule}