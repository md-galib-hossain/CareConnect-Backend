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
exports.DoctorService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const paginationHelper_1 = require("../../utils/paginationHelper");
const doctor_constant_1 = require("./doctor.constant");
const asyncForEach_1 = __importDefault(require("../../utils/asyncForEach"));
const getAllDoctorsFromDB = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm, specialties } = filters, filterData = __rest(filters, ["searchTerm", "specialties"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: doctor_constant_1.doctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    // doctor > doctorSpecialties > specialties -> title
    if (specialties && specialties.length > 0) {
        andConditions.push({
            doctorSpecialties: {
                some: {
                    specialties: {
                        title: {
                            contains: specialties,
                            mode: "insensitive",
                        },
                    },
                },
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
    andConditions.push({
        isDeleted: false,
    });
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.doctor.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { averageRating: "desc" },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true,
                },
            },
        },
    });
    const total = yield prisma_1.default.doctor.count({
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
const getDoctorByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.doctor.findUnique({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true,
                },
            },
            doctorSchedules: true,
            review: true,
        },
    });
    return result;
});
const updateDoctorIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { specialties } = payload, doctorData = __rest(payload, ["specialties"]);
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedDoctor = yield transactionClient.doctor.update({
            where: {
                id,
            },
            data: doctorData,
        });
        if (!updatedDoctor) {
            throw new Error("Unable to update Doctor");
        }
        if (specialties && specialties.length > 0) {
            const deleteSpecialities = specialties.filter((speciality) => speciality.specialtiesId && speciality.isDeleted);
            const previousSpecialties = yield transactionClient.doctorSpecialties.findMany({
                where: {
                    doctorId: id,
                },
            });
            if (previousSpecialties) {
                const missingIds = previousSpecialties
                    .filter((prevSpec) => !specialties.some((someSpec) => someSpec.specialtiesId === prevSpec.specialtiesId))
                    .map((prevSpec) => ({
                    specialtiesId: prevSpec.specialtiesId,
                    isDeleted: true,
                }));
                if (missingIds.length > 0) {
                    deleteSpecialities.push(...missingIds);
                }
            }
            const newSpecialities = specialties.filter((speciality) => speciality.specialtiesId && !speciality.isDeleted);
            yield (0, asyncForEach_1.default)(deleteSpecialities, (deleteDoctorSpeciality) => __awaiter(void 0, void 0, void 0, function* () {
                yield transactionClient.doctorSpecialties.deleteMany({
                    where: {
                        AND: [
                            {
                                doctorId: id,
                            },
                            {
                                specialtiesId: deleteDoctorSpeciality.specialtiesId,
                            },
                        ],
                    },
                });
            }));
            yield (0, asyncForEach_1.default)(newSpecialities, (insertDoctorSpeciality) => __awaiter(void 0, void 0, void 0, function* () {
                const existingSpecialties = yield prisma_1.default.doctorSpecialties.findFirst({
                    where: {
                        specialtiesId: insertDoctorSpeciality.specialtiesId,
                        doctorId: id,
                    },
                });
                if (!existingSpecialties) {
                    yield transactionClient.doctorSpecialties.create({
                        data: {
                            doctorId: id,
                            specialtiesId: insertDoctorSpeciality.specialtiesId,
                        },
                    });
                }
            }));
        }
        return updatedDoctor;
    }));
    console.log(result); // Ensure result is logged for debugging
    return result; // Return result from transaction
});
const deleteDoctorFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const deleteDoctor = yield transactionClient.doctor.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });
        yield transactionClient.user.update({
            where: {
                email: deleteDoctor.email,
            },
            data: {
                status: client_1.UserStatus.DELETED,
            },
        });
        return deleteDoctor;
    }));
});
const getDoctorStatistics = (doctorId, filter) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate } = filter;
    // Common date filter for all queries
    const dateFilter = {
        createdAt: {
            gte: startDate,
            lte: endDate,
        },
    };
    // Appointment counts grouped by status
    const appointmentCountsByStatus = yield prisma_1.default.appointment.groupBy({
        by: ["status"],
        where: Object.assign({ doctorId }, dateFilter),
        _count: {
            _all: true,
        },
    });
    // Doctor schedules count by month
    const doctorSchedulesByMonth = yield prisma_1.default.doctorSchedules.groupBy({
        by: ["createdAt"],
        where: {
            doctorId,
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        _count: {
            _all: true,
        },
    });
    // Process the doctorSchedulesByMonth to group by month
    const schedulesByMonth = doctorSchedulesByMonth.reduce((acc, item) => {
        const month = new Date(item.createdAt).getMonth() + 1; // Get month (1-12)
        acc[month] = (acc[month] || 0) + item._count._all;
        return acc;
    }, {});
    // Unique patients count for lifetime
    const uniquePatientsCount = yield prisma_1.default.appointment.findMany({
        where: {
            doctorId,
        },
        distinct: ["patientId"],
        select: {
            patientId: true,
        },
    });
    // Unique patients count by blood group
    const patientCountByBloodGroup = yield prisma_1.default.patientHealthData.groupBy({
        by: ["bloodGroup"],
        _count: {
            _all: true,
        },
    });
    // Unique patients count by marital status
    const patientCountByMaritalStatus = yield prisma_1.default.patientHealthData.groupBy({
        by: ["maritalStatus"],
        _count: {
            _all: true,
        },
    });
    // Unique patients count by gender
    const patientCountByGender = yield prisma_1.default.patientHealthData.groupBy({
        by: ["gender"],
        _count: {
            _all: true,
        },
    });
    // Payment counts grouped by status
    const paymentCountsByStatus = yield prisma_1.default.payment.groupBy({
        by: ["status"],
        where: {
            appointment: {
                doctorId,
                createdAt: dateFilter.createdAt,
            },
        },
        _count: {
            _all: true,
        },
    });
    // Review counts grouped by rating
    const reviewCountsByRating = yield prisma_1.default.review.groupBy({
        by: ["rating"],
        where: Object.assign({ doctorId }, dateFilter),
        _count: {
            _all: true,
        },
    });
    // Group reviews by rating categories
    const reviewCountsByCategory = {
        "1-2": reviewCountsByRating
            .filter((r) => r.rating <= 2)
            .reduce((sum, r) => { var _a, _b; return sum + ((_b = (_a = r._count) === null || _a === void 0 ? void 0 : _a._all) !== null && _b !== void 0 ? _b : 0); }, 0),
        "3": reviewCountsByRating
            .filter((r) => r.rating === 3)
            .reduce((sum, r) => { var _a, _b; return sum + ((_b = (_a = r._count) === null || _a === void 0 ? void 0 : _a._all) !== null && _b !== void 0 ? _b : 0); }, 0),
        "4-5": reviewCountsByRating
            .filter((r) => r.rating >= 4)
            .reduce((sum, r) => { var _a, _b; return sum + ((_b = (_a = r._count) === null || _a === void 0 ? void 0 : _a._all) !== null && _b !== void 0 ? _b : 0); }, 0),
    };
    return {
        appointmentCountsByStatus,
        doctorSchedulesByMonth: schedulesByMonth,
        uniquePatientsCount,
        patientCountByBloodGroup,
        patientCountByMaritalStatus,
        patientCountByGender,
        paymentCountsByStatus,
        reviewCountsByCategory,
    };
});
exports.DoctorService = {
    getDoctorByIdFromDB,
    getAllDoctorsFromDB,
    updateDoctorIntoDB,
    deleteDoctorFromDB,
    getDoctorStatistics,
};
