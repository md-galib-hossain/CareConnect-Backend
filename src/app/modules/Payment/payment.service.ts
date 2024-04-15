import axios from "axios";
import config from "../../config";
import prisma from "../../utils/prisma";
import { SSLService } from "../SSL/ssl.service";

const initPayment = async (appointmentId: string) => {
  const paymentData = await prisma.payment.findFirstOrThrow({
    where: { appointmentId },
    include:{
        appointment : {
            include: {
                patient: true
            }
        }
    }
  });
  const result = await SSLService.initPyament(paymentData)
  return {paymentUrl: result.GatewayPageURL}
};
export const PaymentService = { initPayment };
