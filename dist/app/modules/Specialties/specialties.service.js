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
exports.SpecialtiesService = void 0;
const fileUploader_1 = require("../../utils/fileUploader");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const paginationHelper_1 = require("../../utils/paginationHelper");
const specialties_constant_1 = require("./specialties.constant");
const createSpecialtiesIntoDB = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (file) {
        const uploadToClodinary = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        req.body.icon = uploadToClodinary === null || uploadToClodinary === void 0 ? void 0 : uploadToClodinary.secure_url;
    }
    const result = yield prisma_1.default.specialties.create({
        data: req.body,
    });
    return result;
});
const getAllSpecialtiesFromDB = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm } = filters;
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: specialties_constant_1.specialtiesSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.specialties.findMany({
        where: Object.assign(Object.assign({}, whereConditions), { isDeleted: false }),
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { title: "asc" },
    });
    const total = yield prisma_1.default.specialties.count({
        where: Object.assign({}, whereConditions),
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
const deleteSpecialtiesFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.specialties.update({
        where: {
            id,
        },
        data: {
            isDeleted: true,
        },
    });
    return result;
});
exports.SpecialtiesService = {
    createSpecialtiesIntoDB,
    getAllSpecialtiesFromDB,
    deleteSpecialtiesFromDB,
};
