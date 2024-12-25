import { NextFunction, Request, RequestHandler, Response } from "express";
import { userService } from "./user.service";
import catchAsync from "../../utils/catchAsync";
import pick from "../../utils/pick";
import { userFilterableFields } from "./user.constant";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { TAuthUser } from "../../interface/interface";

const createAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.createAdminIntoDB(req);
    res.status(200).send({
      success: true,
      message: "Admin created successfully",
      data: result,
    });
  }
);
const createDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.createDoctorIntoDB(req);
    res.status(200).send({
      success: true,
      message: "Doctor created successfully",
      data: result,
    });
  }
);
const createPatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.createPatientIntoDB(req);
    res.status(200).send({
      success: true,
      message: "Patient created successfully",
      data: result,
    });
  }
);
const getUsers = catchAsync(async (req, res) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await userService.getUsersfromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    meta: result?.meta,
    data: result?.data,
  });
});
const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.changeProfileStatus(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users profile status changed!",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req : Request & {user? : TAuthUser}, res : Response) => {
  const result = await userService.getMyProfileFromDB(req?.user as TAuthUser);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My Profile data fetched",

    data: result,
  });
});
const updateMyProfile = catchAsync(async (req : Request & {user? : TAuthUser}, res : Response) => {
  const result = await userService.updateMyProfileIntoDB(req.user as TAuthUser,req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My Profile updated",

    data: result,
  });
});

export const userController = {
  createAdmin,
  createDoctor,
  createPatient,
  getUsers,
  changeProfileStatus,
  getMyProfile,updateMyProfile
};
