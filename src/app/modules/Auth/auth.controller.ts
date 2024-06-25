import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);
  const { refreshToken } = result;
  res.cookie("refreshToken", refreshToken, {
    secure: false,
    httpOnly: true,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: {
      accessToken: result?.accessToken,
      needPasswordChange: result?.needPasswordChange,
    },
  });
});
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  console.log(refreshToken)
  const result = await AuthServices.refreshToken(refreshToken);
  
  //set refresh token into cookie again
  // const { refreshToken } = result;
  // res.cookie("refreshToken", refreshToken, {
  //   secure: false,
  //   httpOnly: true,
  // });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Refresh token successful",
    data: result,
    // data: {
    //   accessToken: result?.accessToken,
    //   needPasswordChange: result?.needPasswordChange,
    // },
  });
});
const changePassword = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await AuthServices.changePasswordIntoDB(req.user, req.body);
    // const { refreshToken } = result;
    // res.cookie("refreshToken", refreshToken, {
    //   secure: false,
    //   httpOnly: true,
    // });
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password changed successfully",
      data: result,
      // data: {
      //   accessToken: result?.accessToken,
      //   needPasswordChange: result?.needPasswordChange,
      // },
    });
  }
);
const forgotPassword = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    
    await AuthServices.forgotPassword(req.body);
    // const { refreshToken } = result;
    // res.cookie("refreshToken", refreshToken, {
    //   secure: false,
    //   httpOnly: true,
    // });
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Check your email inbox",
      data: null,
      // data: {
      //   accessToken: result?.accessToken,
      //   needPasswordChange: result?.needPasswordChange,
      // },
    });
  }
);
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || '';
  await AuthServices.resetPassword(req.body, token);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Account recovered!',
    data: {
      status: 200,
      message: 'Password Reset Successfully',
    },
  });
});

export const AuthController = { loginUser, refreshToken, changePassword,forgotPassword,resetPassword };
