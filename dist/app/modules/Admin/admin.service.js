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
exports.AdminServices = void 0;
const client_1 = require("@prisma/client");
const admin_constant_1 = require("./admin.constant");
const paginationHelper_1 = require("../../utils/paginationHelper");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getAdminsfromDB = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm } = query, remainingQueries = __rest(query, ["searchTerm"]);
    const andConditions = [];
    if (query.searchTerm) {
        andConditions.push({
            OR: admin_constant_1.adminSearchableFields.map((field) => ({
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
    andConditions.push({
        isDeleted: false,
    });
    const whereConditions = {
        AND: andConditions,
    };
    const result = yield prisma_1.default.admin.findMany({
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
    });
    const total = yield prisma_1.default.admin.count({
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
const getSingleAdminFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    return result;
});
const updateAdminIntoDB = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    const result = yield prisma_1.default.admin.update({
        where: {
            id,
        },
        data,
    });
    return result;
});
const deleteAdminFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const deletedAdmin = yield transactionClient.admin.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
            },
        });
        yield transactionClient.user.update({
            where: {
                email: deletedAdmin === null || deletedAdmin === void 0 ? void 0 : deletedAdmin.email,
            },
            data: {
                status: client_1.UserStatus.DELETED,
            },
        });
        return deletedAdmin;
    }));
    return result;
});
exports.AdminServices = {
    getAdminsfromDB,
    getSingleAdminFromDB,
    updateAdminIntoDB,
    deleteAdminFromDB,
};
