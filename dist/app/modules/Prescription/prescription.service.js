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
exports.PrescriptionService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const paginationHelper_1 = require("../../utils/paginationHelper");
const createPrescriptionIntoDB = (payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentData = yield prisma_1.default.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId,
            status: client_1.AppointmentStatus.COMPLETED,
            paymentStatus: client_1.PaymentStatus.PAID,
        },
        include: {
            doctor: true,
        },
    });
    if (!((user === null || user === void 0 ? void 0 : user.email) === (appointmentData === null || appointmentData === void 0 ? void 0 : appointmentData.doctor.email))) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This is not your appointment");
    }
    const result = yield prisma_1.default.prescription.create({
        data: {
            appointmentId: appointmentData.id,
            doctorId: appointmentData.doctorId,
            patientId: appointmentData.patientId,
            instructions: payload.instructions,
            followUpDate: payload.followUpDate || null || undefined,
        },
        include: {
            patient: true,
        },
    });
    return result;
});
const getMyPrescriptionFromDB = (user, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const result = yield prisma_1.default.prescription.findMany({
        where: {
            patient: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
        },
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { createdAt: "desc" },
        include: {
            doctor: true,
            patient: true,
            appointment: true,
        },
    });
    const total = yield prisma_1.default.prescription.count({
        where: {
            patient: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
        },
    });
    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    };
});
exports.PrescriptionService = {
    createPrescriptionIntoDB,
    getMyPrescriptionFromDB,
};
