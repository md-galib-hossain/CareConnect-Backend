import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { MetaService } from "./meta.service";
import { TAuthUser } from "../../interface/interface";

const getDashboardMetaData = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;
    const result = await MetaService.getDashboardMetaDataFromDB(user as TAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Meta retrieval successfully",

      data: result,
    });
  }
);

export const MetaController = { getDashboardMetaData };
