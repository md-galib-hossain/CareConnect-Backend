import { NextFunction, Request, RequestHandler, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { SpecialtiesService } from "./specialties.service";
import pick from "../../utils/pick";

const createSpecialties = catchAsync(async (req, res) => {
  const result = await SpecialtiesService.createSpecialtiesIntoDB(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties created successfully",
    data: result,
  });
});

const getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm']);
  
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
    const result = await SpecialtiesService.getAllSpecialtiesFromDB(filters, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Specialties data fetched successfully',
        data: result,
    });
});

const deleteSpecialties = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SpecialtiesService.deleteSpecialtiesFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Specialty deleted successfully',
        data: result,
    });
});
export const SpecialtiesController = {
  createSpecialties,getAllSpecialties,deleteSpecialties
};
