import { Request, Response } from "express";
import { AdminServices } from "./admin.service";
import pick from "../../utils/pick";
import { adminFilterableFields } from "./admin.constant";


const getAdmins = async (req: Request, res: Response) => {
  try {
    
    const filters = pick(req.query, adminFilterableFields);
    const options = pick(req.query, ['limit','page','sortBy','sortOrder']);
    const result = await AdminServices.getAdminsfromDB(filters,options);
    res.status(200).send({
      success: true,
      message: "Admins retrieved successfully",
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
export const AdminControllers = { getAdmins };
