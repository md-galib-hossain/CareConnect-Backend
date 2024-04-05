import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PatientService } from "./patient.service";
import { Request, Response } from "express";
import { patientFilterableFields } from "./patient.constant";
import pick from "../../utils/pick";

const getAllPatient = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, patientFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await PatientService.getAllPatientFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getByPatientId = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientService.getByPatientIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient retrieval successfully",
    data: result,
  });
});
const updatePatient = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientService.updatePatientIntoDB(id,req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient updated successfully",
    data: result,
  });
});
export const PatientController = {
    getAllPatient,
  getByPatientId,updatePatient
};
