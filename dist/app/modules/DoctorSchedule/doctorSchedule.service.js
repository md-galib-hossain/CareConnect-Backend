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
exports.DoctorScheduleService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const paginationHelper_1 = require("../../utils/paginationHelper");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const createDoctorScheduleIntoDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorData = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            email: user.email
        }
    });
    const doctorScheduleData = payload.scheduleIds.map(scheduleId => ({
        doctorId: doctorData === null || doctorData === void 0 ? void 0 : doctorData.id,
        scheduleId
    }));
    const result = yield prisma_1.default.doctorSchedules.createMany({
        data: doctorScheduleData
    });
    return result;
});
const getMySchedule = (filters, options, user) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { startDateTime, endDateTime } = filters, filterData = __rest(filters, ["startDateTime", "endDateTime"]);
    const whereConditions = Object.assign(Object.assign({ doctor: {
            email: user === null || user === void 0 ? void 0 : user.email,
        } }, (startDateTime && endDateTime
        ? {
            schedule: {
                startDateTime: {
                    gte: new Date(startDateTime),
                },
                endDateTime: {
                    lte: new Date(endDateTime),
                },
            },
        }
        : {})), (Object.keys(filterData).length > 0
        ? {
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        }
        : {}));
    const doctorSchedules = yield prisma_1.default.doctorSchedules.findMany({
        where: whereConditions,
        include: {
            doctor: true,
            schedule: true,
            appointment: true,
        },
        skip,
        take: limit,
        orderBy: {
            createdAt: 'desc',
        },
    });
    return {
        meta: {
            total: doctorSchedules.length,
            page,
            limit,
        },
        data: doctorSchedules,
    };
});
const deleteDoctorScheduleFromDB = (user, scheduleId) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorData = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email
        }
    });
    const isBookedSchedule = yield prisma_1.default.doctorSchedules.findFirst({
        where: {
            doctorId: doctorData.id,
            scheduleId: scheduleId,
            isBooked: true
        }
    });
    if (isBookedSchedule) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You can not delete the schedule because of the schedule is already booked!");
    }
    const result = yield prisma_1.default.doctorSchedules.delete({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId: scheduleId
            }
        }
    });
    return result;
});
const getAllDoctorScheduleFromDB = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm, startDateTime, endDateTime } = filters, filterData = __rest(filters, ["searchTerm", "startDateTime", "endDateTime"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            doctor: {
                name: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            },
        });
    }
    if (startDateTime && endDateTime) {
        andConditions.push({
            schedule: {
                AND: [
                    {
                        startDateTime: {
                            gte: startDateTime,
                        },
                    },
                    {
                        startDateTime: {
                            lte: endDateTime,
                        },
                    },
                ],
            },
        });
    }
    if (Object.keys(filterData).length > 0) {
        if (typeof filterData.isBooked === 'string' &&
            filterData.isBooked === 'true') {
            filterData.isBooked = true;
        }
        else if (typeof filterData.isBooked === 'string' &&
            filterData.isBooked === 'false') {
            filterData.isBooked = false;
        }
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.doctorSchedules.findMany({
        include: {
            doctor: true,
            schedule: true,
        },
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: 'desc',
            },
    });
    const total = yield prisma_1.default.doctorSchedules.count({
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
exports.DoctorScheduleService = { createDoctorScheduleIntoDB, getMySchedule, deleteDoctorScheduleFromDB, getAllDoctorScheduleFromDB };
