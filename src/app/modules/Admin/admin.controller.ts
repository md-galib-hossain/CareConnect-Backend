import { Request, Response } from "express";
import { AdminServices } from "./admin.service";

const getAdmins = async (req: Request, res: Response) => {
    
  try {
    const result = await AdminServices.findAdminsfromDB(req.query);
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
