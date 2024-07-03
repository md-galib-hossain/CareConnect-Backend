"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
exports.default = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    JWT: {
        ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
        ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
        REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
        RESET_PASSWORD_TOKEN: process.env.RESET_PASSWORD_TOKEN,
        RESET_PASSWORD_TOKEN_EXPIRES_IN: process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN,
        RESET_PASSWORD_LINK: process.env.RESET_PASSWORD_LINK,
    },
    EMAIL_SENDER: {
        EMAIL: process.env.EMAIL,
        APP_PASSWORD: process.env.APP_PASSWORD,
    },
    SSL: {
        STORE_ID: process.env.STORE_ID,
        STORE_PASSWORD: process.env.STORE_PASSWORD,
        CANCEL_URL: process.env.CANCEL_URL,
        FAIL_URL: process.env.FAIL_URL,
        SSL_PAYMENT_URL: process.env.SSL_PAYMENT_URL,
        SUCCESS_URL: process.env.SUCCESS_URL,
        SSL_VALIDATION_URL: process.env.SSL_VALIDATION_URL
    }
};
