import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import { ScheduleService } from "./schedule.service";
import { TAuthUser } from "../../interface/interface";
import pick from "../../utils/pick";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
    const result = await ScheduleService.createScheduleIntoDB(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Schedule created successfully!",
        data: result
    });
});
const getAllSchedule = catchAsync(async (req: Request & { user?: TAuthUser }, res: Response) => {
    const filters = pick(req.query, ['startDateTime', 'endDateTime']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

    const user = req.user;
    const result = await ScheduleService.getAllScheduleFromDB(filters, options, user as TAuthUser);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Schedule fetched successfully!",
        data: result
    });
});

const getScheduleById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ScheduleService.getScheduleByIdFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Schedule retrieval successfully',
        data: result,
    });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ScheduleService.deleteScheduleFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Schedule deleted successfully',
        data: result,
    });
});

export const ScheduleController = {
    createSchedule,deleteSchedule,getScheduleById,getAllSchedule
};