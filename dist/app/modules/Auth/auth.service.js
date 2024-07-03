"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.AuthServices = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const bcrypt = __importStar(require("bcrypt"));
const auth_utils_1 = require("./auth.utils");
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("../../config"));
const emailsender_1 = __importDefault(require("../../utils/emailsender"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const jwtHelpers_1 = require("../../utils/jwtHelpers");
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const isCorrectPassword = yield bcrypt.compare(payload === null || payload === void 0 ? void 0 : payload.password, userData.password);
    if (!isCorrectPassword) {
        throw new Error("Invalid password");
    }
    const accessToken = (0, auth_utils_1.generateToken)({
        email: userData === null || userData === void 0 ? void 0 : userData.email,
        role: userData === null || userData === void 0 ? void 0 : userData.role,
        status: userData === null || userData === void 0 ? void 0 : userData.status,
        id: userData === null || userData === void 0 ? void 0 : userData.id,
        isDeleted: userData === null || userData === void 0 ? void 0 : userData.isDeleted,
    }, config_1.default.JWT.ACCESS_TOKEN_SECRET, config_1.default.JWT.ACCESS_TOKEN_EXPIRES_IN);
    const refreshToken = (0, auth_utils_1.generateToken)({
        email: userData === null || userData === void 0 ? void 0 : userData.email,
        role: userData === null || userData === void 0 ? void 0 : userData.role,
        status: userData === null || userData === void 0 ? void 0 : userData.status,
        id: userData === null || userData === void 0 ? void 0 : userData.id,
        isDeleted: userData === null || userData === void 0 ? void 0 : userData.isDeleted,
    }, config_1.default.JWT.REFRESH_TOKEN_SECRET, config_1.default.JWT.REFRESH_TOKEN_EXPIRES_IN);
    return {
        accessToken,
        refreshToken,
        needPasswordChange: userData === null || userData === void 0 ? void 0 : userData.needsPasswordChange,
    };
});
//refresh token start
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let decodedData;
    try {
        decodedData = (0, auth_utils_1.verifyToken)(token, config_1.default.JWT.REFRESH_TOKEN_SECRET);
        console.log(decodedData);
    }
    catch (err) {
        console.log(err);
        throw new Error("You are not authorized");
    }
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: decodedData === null || decodedData === void 0 ? void 0 : decodedData.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const accessToken = (0, auth_utils_1.generateToken)({
        email: userData === null || userData === void 0 ? void 0 : userData.email,
        role: userData === null || userData === void 0 ? void 0 : userData.role,
        status: userData === null || userData === void 0 ? void 0 : userData.status,
        id: userData === null || userData === void 0 ? void 0 : userData.id,
        isDeleted: userData === null || userData === void 0 ? void 0 : userData.isDeleted,
    }, config_1.default.JWT.ACCESS_TOKEN_SECRET, config_1.default.JWT.ACCESS_TOKEN_EXPIRES_IN);
    return {
        accessToken,
        needPasswordChange: userData === null || userData === void 0 ? void 0 : userData.needsPasswordChange,
    };
});
//refresh token end
const changePasswordIntoDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findFirstOrThrow({
        where: {
            email: user.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const isCorrectPassword = yield bcrypt.compare(payload === null || payload === void 0 ? void 0 : payload.oldPassword, userData === null || userData === void 0 ? void 0 : userData.password);
    if (!isCorrectPassword) {
        throw new Error("password incorrect!");
    }
    const hashedPassword = yield bcrypt.hash(payload === null || payload === void 0 ? void 0 : payload.newPassword, 10);
    yield prisma_1.default.user.update({
        where: {
            email: userData.email,
        },
        data: {
            password: hashedPassword,
            needsPasswordChange: false,
        },
    });
    return {
        message: "Password changed successfully",
    };
});
const forgotPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield prisma_1.default.user.findUnique({
        where: {
            email: payload === null || payload === void 0 ? void 0 : payload.email,
            status: client_1.UserStatus.ACTIVE
        }
    });
    if (!isUserExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User does not exist!");
    }
    const passResetToken = yield jwtHelpers_1.jwtHelpers.createPasswordResetToken({
        id: isUserExist.id
    });
    const resetLink = config_1.default.JWT.RESET_PASSWORD_LINK + `?id=${isUserExist.id}&token=${passResetToken}`;
    console.log({ resetLink });
    yield (0, emailsender_1.default)(payload === null || payload === void 0 ? void 0 : payload.email, `
    <div>
      <p>Dear ${isUserExist.role},</p>
      <p>Your password reset link: <a href=${resetLink}><button>RESET PASSWORD<button/></a></p>
      <p>Thank you</p>
    </div>
`);
});
const resetPassword = (payload, token) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield prisma_1.default.user.findUnique({
        where: {
            id: payload.id,
            status: client_1.UserStatus.ACTIVE
        }
    });
    if (!isUserExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User not found!");
    }
    const isVarified = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.JWT.RESET_PASSWORD_TOKEN);
    if (!isVarified) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Something went wrong!");
    }
    const password = yield bcrypt.hash(payload.newPassword, 10);
    yield prisma_1.default.user.update({
        where: {
            id: payload.id
        },
        data: {
            password
        }
    });
});
exports.AuthServices = {
    loginUser,
    refreshToken,
    changePasswordIntoDB,
    forgotPassword,
    resetPassword,
};
