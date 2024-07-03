"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const ssl_service_1 = require("../SSL/ssl.service");
const client_1 = require("@prisma/client");
const initPayment = (appointmentId) => __awaiter(void 0, void 0, void 0, function* () {
    const paymentData = yield prisma_1.default.payment.findFirstOrThrow({
        where: { appointmentId },
        include: {
            appointment: {
                include: {
                    patient: true,
                },
            },
        },
    });
    const initPaymentData = {
        amount: paymentData.amount,
        transactionId: paymentData.transactionId,
        name: paymentData.appointment.patient.name,
        email: paymentData.appointment.patient.email,
        address: paymentData.appointment.patient.address,
        phoneNumber: paymentData.appointment.patient.contactNumber
    };
    const result = yield ssl_service_1.SSLService.initPyament(initPaymentData);
    return { paymentUrl: result.GatewayPageURL };
});
const validatePayment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    //* use after deploy
    // if (!payload.length || !payload.status || !(payload.status === "VALID")) {
    //   return {
    //     messsage: "Invalid Payment",
    //   };
    // }
    // const response = await SSLService.validatePayment(payload);
    // if (response?.status !== "VALID") {
    //   return {
    //     messsage: "Payment Failed",
    //   };
    // }
    //* for local
    const response = payload;
    yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedPaymentData = yield tx.payment.update({
            where: {
                transactionId: response === null || response === void 0 ? void 0 : response.tran_id,
            },
            data: {
                status: client_1.PaymentStatus.PAID,
                paymentGatewayData: response,
            },
        });
        yield tx.appointment.update({
            where: {
                id: updatedPaymentData.appointmentId,
            },
            data: {
                paymentStatus: client_1.PaymentStatus.PAID
            },
        });
    }));
    return {
        message: "Payment successful"
    };
});
exports.PaymentService = { initPayment, validatePayment };
