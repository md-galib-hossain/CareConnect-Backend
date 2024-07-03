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
exports.AuthController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const auth_service_1 = require("./auth.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const loginUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.AuthServices.loginUser(req.body);
    const { refreshToken } = result;
    res.cookie("refreshToken", refreshToken, {
        secure: false,
        httpOnly: true,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Login successful",
        data: {
            accessToken: result === null || result === void 0 ? void 0 : result.accessToken,
            needPasswordChange: result === null || result === void 0 ? void 0 : result.needPasswordChange,
        },
    });
}));
const refreshToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    const result = yield auth_service_1.AuthServices.refreshToken(refreshToken);
    //set refresh token into cookie again
    // const { refreshToken } = result;
    // res.cookie("refreshToken", refreshToken, {
    //   secure: false,
    //   httpOnly: true,
    // });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Refresh token successful",
        data: result,
        // data: {
        //   accessToken: result?.accessToken,
        //   needPasswordChange: result?.needPasswordChange,
        // },
    });
}));
const changePassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.AuthServices.changePasswordIntoDB(req.user, req.body);
    // const { refreshToken } = result;
    // res.cookie("refreshToken", refreshToken, {
    //   secure: false,
    //   httpOnly: true,
    // });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Password changed successfully",
        data: result,
        // data: {
        //   accessToken: result?.accessToken,
        //   needPasswordChange: result?.needPasswordChange,
        // },
    });
}));
const forgotPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield auth_service_1.AuthServices.forgotPassword(req.body);
    // const { refreshToken } = result;
    // res.cookie("refreshToken", refreshToken, {
    //   secure: false,
    //   httpOnly: true,
    // });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Check your email inbox",
        data: null,
        // data: {
        //   accessToken: result?.accessToken,
        //   needPasswordChange: result?.needPasswordChange,
        // },
    });
}));
const resetPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization || '';
    yield auth_service_1.AuthServices.resetPassword(req.body, token);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Account recovered!',
        data: {
            status: 200,
            message: 'Password Reset Successfully',
        },
    });
}));
exports.AuthController = { loginUser, refreshToken, changePassword, forgotPassword, resetPassword };
