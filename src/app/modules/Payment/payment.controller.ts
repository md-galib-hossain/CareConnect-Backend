import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const initPayment = catchAsync(async (req: Request, res: Response) => {

  const {appointmentId} = req.params
    const result = await PaymentService.initPayment(appointmentId)
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment initiate successfully",
      data: result,
    });
  });
  export const PaymentController = {initPayment}