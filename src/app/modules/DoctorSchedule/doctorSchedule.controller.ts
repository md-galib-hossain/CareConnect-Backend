import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { TAuthUser } from "../../interface/interface";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { DoctorScheduleService } from "./doctorSchedule.service";
import pick from "../../utils/pick";
import { scheduleFilterableFields } from "./doctorSchedule.constant";

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
const getMySchedule = catchAsync(async (req: Request & { user?: TAuthUser }, res: Response) => {
    const filters = pick(req.query, ['startDate', 'endDate', 'isBooked']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

    const user = req.user;
    const result = await DoctorScheduleService.getMySchedule(filters, options, user as TAuthUser);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My Schedule fetched successfully!",
        data: result
    });
});

const deleteDoctorSchedule = catchAsync(async (req: Request & { user?: TAuthUser }, res: Response) => {

    const user = req.user;
    const { id } = req.params;
    const result = await DoctorScheduleService.deleteDoctorScheduleFromDB(user as TAuthUser, id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My Schedule deleted successfully!",
        data: result
    });
});

const getAllDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, scheduleFilterableFields);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await DoctorScheduleService.getAllDoctorScheduleFromDB(filters, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Doctor Schedule retrieval successfully',
        meta: result.meta,
        data: result.data,
    });
});

export const DoctorScheduleController = {createDoctorSchedule,getMySchedule,getAllDoctorSchedule,deleteDoctorSchedule}