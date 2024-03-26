import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";

const createAdmin = async (req: Request, res: Response,next: NextFunction) => {
  try {
    const result = await userService.createAdminIntoDB(req);
    res.status(200).send({
      success: true,
      message: "Admin created successfully",
      data: result,
    });
  } catch (err : any) {
    res.status(500).json({
        success : false,
        message : err?.name || 'Something went wrong',
        error : err

    })
  }
};

export const userController = { createAdmin };
