import axios from "axios";
import config from "../../config";
import prisma from "../../utils/prisma";
import { SSLService } from "../SSL/ssl.service";
import { PaymentStatus } from "@prisma/client";

const initPayment = async (appointmentId: string) => {
  const paymentData = await prisma.payment.findFirstOrThrow({
    where: { appointmentId },
    include: {
      appointment: {
        include: {
          patient: true,
        },
      },
    },
  });
  const result = await SSLService.initPyament(paymentData);
  return { paymentUrl: result.GatewayPageURL };
};

const validatePayment = async (payload: any) => {
  if (!payload.length || !payload.status || !(payload.status === "VALID")) {
    return {
      messsage: "Invalid Payment",
    };
  }
  const response = await SSLService.validatePayment(payload);
  if (response?.status !== "VALID") {
    return {
      messsage: "Payment Failed",
    };
  }
  await prisma.$transaction(async (tx) => {
    const updatedPaymentData = await tx.payment.update({
      where: {
        transactionId: response?.tran_id,
      },
      data: {
        status: PaymentStatus.PAID,
        paymentGatewayData: response,
      },
    });

    await tx.appointment.update({
      where: {
        id: updatedPaymentData.appointmentId,
      },
      data: {
        paymentStatus : PaymentStatus.PAID
      },
    });
  });
  return {
    message : "Payment successful"
  }
};
export const PaymentService = { initPayment, validatePayment };
