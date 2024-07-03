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
exports.MetaService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getDashboardMetaDataFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    let metaData;
    switch (user === null || user === void 0 ? void 0 : user.role) {
        case client_1.UserRole.SUPER_ADMIN:
            metaData = getSuperAdminMetaData();
            break;
        case client_1.UserRole.ADMIN:
            metaData = getAdminMetaData();
            break;
        case client_1.UserRole.DOCTOR:
            metaData = getDoctorMetaData(user);
            break;
        case client_1.UserRole.PATIENT:
            metaData = getPatientMetaData(user);
            break;
        default:
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid user");
    }
    return metaData;
});
//* super admin *//
const getSuperAdminMetaData = () => __awaiter(void 0, void 0, void 0, function* () {
    const appointmenCount = yield prisma_1.default.appointment.count();
    const patientCount = yield prisma_1.default.patient.count();
    const doctorCount = yield prisma_1.default.doctor.count();
    const paymentCount = yield prisma_1.default.payment.count();
    const adminCount = yield prisma_1.default.admin.count();
    const totalRevenue = yield prisma_1.default.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            status: client_1.PaymentStatus.PAID,
        },
    });
    const barChartData = yield getBarChartData();
    const pieChartData = yield getPieChartData();
    return {
        appointmenCount,
        doctorCount,
        paymentCount,
        patientCount,
        totalRevenue,
        adminCount,
        barChartData,
        pieChartData,
    };
});
//* admin *//
const getAdminMetaData = () => __awaiter(void 0, void 0, void 0, function* () {
    const appointmenCount = yield prisma_1.default.appointment.count();
    const patientCount = yield prisma_1.default.patient.count();
    const doctorCount = yield prisma_1.default.doctor.count();
    const paymentCount = yield prisma_1.default.payment.count();
    const totalRevenue = yield prisma_1.default.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            status: client_1.PaymentStatus.PAID,
        },
    });
    const barChartData = yield getBarChartData();
    const pieChartData = yield getPieChartData();
    return {
        appointmenCount,
        doctorCount,
        paymentCount,
        patientCount,
        totalRevenue,
        barChartData,
        pieChartData,
    };
});
//* doctor *//
const getDoctorMetaData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorData = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    const appointmentCount = yield prisma_1.default.appointment.count({
        where: {
            doctorId: doctorData.id,
        },
    });
    const patientCount = yield prisma_1.default.appointment.groupBy({
        by: ["patientId"],
        where: {
            doctorId: doctorData.id,
        },
    });
    const reviewCount = yield prisma_1.default.review.count({
        where: {
            doctorId: doctorData.id,
        },
    });
    const totalRevenue = yield prisma_1.default.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            appointment: {
                doctorId: doctorData.id,
            },
            status: client_1.PaymentStatus.PAID,
        },
    });
    const appointmentStatusDistribution = yield prisma_1.default.appointment.groupBy({
        by: ["status"],
        _count: { id: true },
        where: {
            doctorId: doctorData.id,
        },
    });
    //formated appointment status distributions
    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map((count) => ({
        status: count.status,
        count: Number(count._count.id),
    }));
    //   console.dir(formattedAppointmentStatusDistribution, { depth: "infinity" });
    return {
        formattedAppointmentStatusDistribution,
        totalRevenue,
        reviewCount,
        patientCount: patientCount.length,
        appointmentCount,
    };
});
//* patient *//
const getPatientMetaData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const patientData = yield prisma_1.default.patient.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    const appointmentCount = yield prisma_1.default.appointment.count({
        where: {
            patientId: patientData.id,
        },
    });
    const prescriptionCount = yield prisma_1.default.prescription.count({
        where: {
            patientId: patientData.id,
        },
    });
    const reviewCount = yield prisma_1.default.review.count({
        where: {
            patientId: patientData.id,
        },
    });
    const appointmentStatusDistribution = yield prisma_1.default.appointment.groupBy({
        by: ["status"],
        _count: { id: true },
        where: {
            patientId: patientData.id,
        },
    });
    //formated appointment status distributions
    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map((count) => ({
        status: count.status,
        count: Number(count._count.id),
    }));
    return {
        formattedAppointmentStatusDistribution,
        reviewCount,
        appointmentCount,
        prescriptionCount,
    };
});
//* Bar Chart *//
const getBarChartData = () => __awaiter(void 0, void 0, void 0, function* () {
    //selecting month by getting from created at timestamp , picked month using date_trunc
    // converting count from bigint to integer
    //group by month
    //order by month in ascending order
    const appointmentCountByMonth = yield prisma_1.default.$queryRaw `
    SELECT DATE_TRUNC ('month',"createdAt") AS month,
    
    CAST( COUNT(*) AS INTEGER) AS count 
    FROM "appointments"
    GROUP BY month
    ORDER BY month ASC
    `;
    return appointmentCountByMonth;
});
//* Pie Chart *//
const getPieChartData = () => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentStatusDistribution = yield prisma_1.default.appointment.groupBy({
        by: ["status"],
        _count: { id: true },
    });
    //formated appointment status distributions
    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map((count) => ({
        status: count.status,
        count: Number(count._count.id),
    }));
    return formattedAppointmentStatusDistribution;
});
exports.MetaService = { getDashboardMetaDataFromDB };
