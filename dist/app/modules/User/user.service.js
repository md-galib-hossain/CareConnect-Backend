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
exports.userService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const fileUploader_1 = require("../../utils/fileUploader");
const paginationHelper_1 = require("../../utils/paginationHelper");
const user_constant_1 = require("./user.constant");
const createAdminIntoDB = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const file = req.file;
    if (file) {
        const uploadToCloudinary = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        req.body.admin.profilePhoto = uploadToCloudinary === null || uploadToCloudinary === void 0 ? void 0 : uploadToCloudinary.secure_url;
    }
    const hashedPassword = yield bcrypt_1.default.hash((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.password, 10);
    const userData = {
        email: (_c = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.admin) === null || _c === void 0 ? void 0 : _c.email,
        password: hashedPassword,
        role: client_1.UserRole.ADMIN,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const createdUserData = yield transactionClient.user.create({
            data: userData,
        });
        const createdAdminData = yield transactionClient.admin.create({
            data: (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.admin,
        });
        return createdAdminData;
    }));
    return result;
});
const createDoctorIntoDB = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const file = req.file;
    if (file) {
        const uploadToCloudinary = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        req.body.doctor.profilePhoto = uploadToCloudinary === null || uploadToCloudinary === void 0 ? void 0 : uploadToCloudinary.secure_url;
    }
    const hashedPassword = yield bcrypt_1.default.hash((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.password, 10);
    const userData = {
        email: (_c = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.doctor) === null || _c === void 0 ? void 0 : _c.email,
        password: hashedPassword,
        role: client_1.UserRole.DOCTOR,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const createdUserData = yield transactionClient.user.create({
            data: userData,
        });
        const createdDoctorData = yield transactionClient.doctor.create({
            data: (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.doctor,
        });
        return createdDoctorData;
    }));
    return result;
});
const createPatientIntoDB = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const file = req.file;
    if (file) {
        const uploadToCloudinary = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        req.body.patient.profilePhoto = uploadToCloudinary === null || uploadToCloudinary === void 0 ? void 0 : uploadToCloudinary.secure_url;
    }
    const hashedPassword = yield bcrypt_1.default.hash((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.password, 10);
    const userData = {
        email: (_c = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.patient) === null || _c === void 0 ? void 0 : _c.email,
        password: hashedPassword,
        role: client_1.UserRole.PATIENT,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const createdUserData = yield transactionClient.user.create({
            data: userData,
        });
        const createdPatientData = yield transactionClient.patient.create({
            data: (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.patient,
        });
        return createdPatientData;
    }));
    return result;
});
const getUsersfromDB = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm } = query, remainingQueries = __rest(query, ["searchTerm"]);
    const andConditions = [];
    if (query.searchTerm) {
        andConditions.push({
            OR: user_constant_1.userSearchableFields.map((field) => ({
                [field]: {
                    contains: query.searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (Object.keys(remainingQueries).length > 0) {
        andConditions.push({
            AND: Object.keys(remainingQueries).map((key) => ({
                [key]: {
                    equals: remainingQueries[key],
                },
            })),
        });
    }
    const whereConditions = andConditions.length > 0
        ? {
            AND: andConditions,
        }
        : {};
    const result = yield prisma_1.default.user.findMany({
        // where : {
        //     name :{
        //         contains : query.searchTerm as string,
        //         mode: 'insensitive'
        //     }
        // }
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        select: {
            id: true,
            email: true,
            role: true,
            needsPasswordChange: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            admin: true,
            patient: true,
            doctor: true,
        },
        // include:{admin:true,patient:true,doctor:true}
    });
    const total = yield prisma_1.default.user.count({
        where: whereConditions,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const changeProfileStatus = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id,
        },
    });
    const updateUserStatus = yield prisma_1.default.user.update({
        where: {
            id,
        },
        data: status,
    });
    return updateUserStatus;
});
const getMyProfileFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userInfo = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
            status: client_1.UserStatus.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            needsPasswordChange: true,
            role: true,
            status: true,
        },
    });
    let profileInfo;
    if ((userInfo === null || userInfo === void 0 ? void 0 : userInfo.role) === client_1.UserRole.SUPER_ADMIN) {
        profileInfo = yield prisma_1.default.admin.findUniqueOrThrow({
            where: {
                email: userInfo.email,
            },
        });
    }
    else if ((userInfo === null || userInfo === void 0 ? void 0 : userInfo.role) === client_1.UserRole.ADMIN) {
        profileInfo = yield prisma_1.default.admin.findUniqueOrThrow({
            where: {
                email: userInfo.email,
            },
        });
    }
    else if ((userInfo === null || userInfo === void 0 ? void 0 : userInfo.role) === client_1.UserRole.DOCTOR) {
        profileInfo = yield prisma_1.default.doctor.findUniqueOrThrow({
            where: {
                email: userInfo.email,
            },
            include: {
                doctorSpecialties: {
                    include: {
                        specialties: true
                    }
                }
            }
        });
    }
    else if ((userInfo === null || userInfo === void 0 ? void 0 : userInfo.role) === client_1.UserRole.PATIENT) {
        profileInfo = yield prisma_1.default.patient.findUniqueOrThrow({
            where: {
                email: userInfo.email,
            },
        });
    }
    return Object.assign(Object.assign({}, userInfo), profileInfo);
});
const updateMyProfileIntoDB = (user, req) => __awaiter(void 0, void 0, void 0, function* () {
    const userInfo = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
            status: client_1.UserStatus.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            needsPasswordChange: true,
            role: true,
            status: true,
        },
    });
    const file = req.file;
    if (file) {
        const uploadToCloudinary = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        req.body.profilePhoto = uploadToCloudinary === null || uploadToCloudinary === void 0 ? void 0 : uploadToCloudinary.secure_url;
    }
    let profileInfo;
    if ((userInfo === null || userInfo === void 0 ? void 0 : userInfo.role) === client_1.UserRole.SUPER_ADMIN) {
        profileInfo = yield prisma_1.default.admin.update({
            where: {
                email: userInfo.email,
            },
            data: req.body,
        });
    }
    else if ((userInfo === null || userInfo === void 0 ? void 0 : userInfo.role) === client_1.UserRole.ADMIN) {
        profileInfo = yield prisma_1.default.admin.update({
            where: {
                email: userInfo.email,
            },
            data: req.body,
        });
    }
    else if ((userInfo === null || userInfo === void 0 ? void 0 : userInfo.role) === client_1.UserRole.DOCTOR) {
        profileInfo = yield prisma_1.default.doctor.update({
            where: {
                email: userInfo.email,
            },
            data: req.body,
        });
    }
    else if ((userInfo === null || userInfo === void 0 ? void 0 : userInfo.role) === client_1.UserRole.PATIENT) {
        profileInfo = yield prisma_1.default.patient.update({
            where: {
                email: userInfo.email,
            },
            data: req.body,
        });
    }
    return Object.assign({}, profileInfo);
});
exports.userService = {
    createAdminIntoDB,
    createDoctorIntoDB,
    createPatientIntoDB,
    getUsersfromDB,
    changeProfileStatus,
    getMyProfileFromDB,
    updateMyProfileIntoDB,
};
