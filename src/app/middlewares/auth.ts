import { Secret } from "jsonwebtoken";
import config from "../config";
import { verifyToken } from "../modules/Auth/auth.utils";
import { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import httpStatus from "http-status";

const auth = (...roles: string[]) => {
  return async (req: Request &{user?: any}, res: Response, next: NextFunction) => {
    try {
      const token = req?.headers?.authorization;
      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED,"you are unauthorized");
      }
      const verifiedUser = verifyToken(
        token,
        config.JWT.ACCESS_TOKEN_SECRET as Secret
      );
      req.user = verifiedUser
      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new AppError(httpStatus.UNAUTHORIZED,"you are unauthorized");
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
export default auth;
