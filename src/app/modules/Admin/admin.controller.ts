import { Request, Response } from "express";
import { AdminServices } from "./admin.service";
import pick from "../../utils/pick";
import { adminFilterableFields } from "./admin.constant";
import sendResponse from "../../utils/sendResponse";

const getAdmins = async (req: Request, res: Response) => {
  try {
    const filters = pick(req.query, adminFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await AdminServices.getAdminsfromDB(filters, options);
    // res.status(200).send({
    //   success: true,
    //   message: "Admins retrieved successfully",
    //   meta: result?.meta,
    //   data: result?.data,
    // });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admins retrieved successfully",
      meta: result?.meta,
      data: result?.data,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.name || "Something went wrong",
      error: err,
    });
  }
};

const getSingleAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await AdminServices.getSingleAdminFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.name || "Something went wrong",
      error: err,
    });
  }
};

const updateSingleAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await AdminServices.updateAdminIntoDB(id, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin updated successfully",

      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.name || "Something went wrong",
      error: err,
    });
  }
};
const deleteSingleAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await AdminServices.deleteAdminFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin deleted successfully",

      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.name || "Something went wrong",
      error: err,
    });
  }
};
export const AdminControllers = {
  getAdmins,
  getSingleAdmin,
  updateSingleAdmin,
  deleteSingleAdmin,
};
