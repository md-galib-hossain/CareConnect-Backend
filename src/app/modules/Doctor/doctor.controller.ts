import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { DoctorService } from "./doctor.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import pick from "../../utils/pick";
import { doctorFilterableFields } from "./doctor.constant";

const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, doctorFilterableFields);

    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

    const result = await DoctorService.getAllDoctorsFromDB(filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Doctors retrieval successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getDoctorById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DoctorService.getDoctorByIdFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Doctor retrieval successfully',
        data: result,
    });
});
const updateDoctor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DoctorService.updateDoctorIntoDB(id,req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Doctor updated successfully',
        data: result,
    });
});

const deleteDoctor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DoctorService.deleteDoctorFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Doctor soft deleted successfully',
        data: result,
    });
});

export const DoctorController= {getDoctorById,getAllDoctors,updateDoctor,deleteDoctor}