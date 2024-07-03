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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const client_1 = require("@prisma/client");
const paginationHelper_1 = require("../../utils/paginationHelper");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const uuid_1 = require("uuid");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const createAppointmentIntoDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const patientData = yield prisma_1.default.patient.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    const doctorData = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            id: payload === null || payload === void 0 ? void 0 : payload.doctorId,
        },
    });
    yield prisma_1.default.doctorSchedules.findFirstOrThrow({
        where: {
            doctorId: doctorData === null || doctorData === void 0 ? void 0 : doctorData.id,
            scheduleId: payload.scheduleId,
            isBooked: false,
        },
    });
    const videoCallingId = (0, uuid_1.v4)();
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const appointmentData = yield tx.appointment.create({
            data: {
                patientId: patientData === null || patientData === void 0 ? void 0 : patientData.id,
                doctorId: doctorData === null || doctorData === void 0 ? void 0 : doctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId,
            },
            include: {
                patient: true,
                doctor: true,
                schedule: true,
            },
        });
        yield tx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData === null || doctorData === void 0 ? void 0 : doctorData.id,
                    scheduleId: payload === null || payload === void 0 ? void 0 : payload.scheduleId,
                },
            },
            data: {
                isBooked: true,
                appointmentId: appointmentData === null || appointmentData === void 0 ? void 0 : appointmentData.id,
            },
        });
        //generate transaction id : careconnect-9/4/2024
        const today = new Date();
        const transactionId = "Care-Connect" +
            today.getFullYear() +
            "-" +
            today.getMonth() +
            "-" +
            today.getDay() +
            "-" +
            today.getHours() +
            "-" +
            today.getMinutes();
        yield tx.payment.create({
            data: {
                appointmentId: appointmentData === null || appointmentData === void 0 ? void 0 : appointmentData.id,
                amount: doctorData === null || doctorData === void 0 ? void 0 : doctorData.appointmentFee,
                transactionId: transactionId,
            },
        });
        return appointmentData;
    }));
    return result;
});
const getMyAppointmentFromDB = (user, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const filterData = __rest(filters, []);
    const andConditions = [];
    if ((user === null || user === void 0 ? void 0 : user.role) === client_1.UserRole.PATIENT) {
        andConditions.push({
            patient: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
        });
    }
    else if ((user === null || user === void 0 ? void 0 : user.role) === client_1.UserRole.DOCTOR) {
        andConditions.push({
            doctor: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
        });
    }
    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: filterData[key],
            },
        }));
        andConditions.push(...filterConditions);
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { createdAt: "desc" },
        include: (user === null || user === void 0 ? void 0 : user.role) === client_1.UserRole.PATIENT
            ? { doctor: true, schedule: true, review: true }
            : {
                patient: {
                    include: { medicalReport: true, patientHealthData: true },
                },
                schedule: true,
            },
    });
    const total = yield prisma_1.default.appointment.count({
        where: whereConditions,
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
});
//*get all appointments
const getAllAppointmentFromDB = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { patientEmail, doctorEmail } = filters, filterData = __rest(filters, ["patientEmail", "doctorEmail"]);
    const andConditions = [];
    if (patientEmail) {
        andConditions.push({
            patient: {
                email: patientEmail,
            },
        });
    }
    else if (doctorEmail) {
        andConditions.push({
            doctor: {
                email: doctorEmail,
            },
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => {
                return {
                    [key]: {
                        equals: filterData[key],
                    },
                };
            }),
        });
    }
    // console.dir(andConditions, { depth: Infinity })
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: "desc",
            },
        include: {
            doctor: {
                include: {
                    doctorSpecialties: {
                        include: {
                            specialties: true
                        }
                    }
                }
            },
            patient: true,
            doctorSchedules: {
                include: {
                    schedule: true,
                },
            }
        },
    });
    const total = yield prisma_1.default.appointment.count({
        where: whereConditions,
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
});
const changeAppointmentStatusIntoDB = (appointmentId, status, user) => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentData = yield prisma_1.default.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId,
        },
        include: {
            doctor: true
        }
    });
    if ((user === null || user === void 0 ? void 0 : user.role) === client_1.UserRole.DOCTOR) {
        if (!((user === null || user === void 0 ? void 0 : user.email) === appointmentData.doctor.email)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This is not your appointment");
        }
    }
    const result = yield prisma_1.default.appointment.update({
        where: {
            id: appointmentId,
        },
        data: {
            status,
        },
    });
    return result;
});
const cancelUnpaidAppointments = () => __awaiter(void 0, void 0, void 0, function* () {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    //getting appointments which are older than 30 mins
    const UnpaidAppointments = yield prisma_1.default.appointment.findMany({
        where: {
            createdAt: {
                lte: thirtyMinAgo
            },
            paymentStatus: client_1.PaymentStatus.UNPAID
        }
    });
    //getting the unpaid appointment ids which are 30 min old
    const appointmenIdsToCancel = UnpaidAppointments.map(appointment => appointment.id);
    yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.payment.deleteMany({
            where: {
                appointmentId: {
                    in: appointmenIdsToCancel
                }
            }
        });
        yield tx.appointment.deleteMany({
            where: {
                id: {
                    in: appointmenIdsToCancel
                }
            }
        });
        for (const UnpaidAppointment of UnpaidAppointments) {
            yield tx.doctorSchedules.updateMany({
                where: {
                    doctorId: UnpaidAppointment.doctorId,
                    scheduleId: UnpaidAppointment.scheduleId
                },
                data: {
                    isBooked: false
                }
            });
        }
    }));
});
exports.AppointmentService = {
    createAppointmentIntoDB,
    getMyAppointmentFromDB,
    getAllAppointmentFromDB,
    changeAppointmentStatusIntoDB, cancelUnpaidAppointments
};
