"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./app/routes"));
const http_status_1 = __importDefault(require("http-status"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const appointment_service_1 = require("./app/modules/Appointment/appointment.service");
const node_cron_1 = __importDefault(require("node-cron"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: ["https://careconnect-frontend.vercel.app", "http://localhost:3000"], credentials: true }));
app.use((0, cookie_parser_1.default)());
//parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
//check each miniutes if any appointment is not paid in less or equal than 30 mins then deleete that appointment
node_cron_1.default.schedule("* * * * *", () => {
    try {
        appointment_service_1.AppointmentService.cancelUnpaidAppointments();
    }
    catch (err) {
        console.log(err);
    }
});
app.get("/", (req, res) => {
    res.send({
        message: "Hello",
    });
});
app.use("/api/v1", routes_1.default);
app.use(globalErrorHandler_1.default);
app.use((req, res, next) => {
    res.status(http_status_1.default.NOT_FOUND).json({
        success: false,
        message: "API not found!",
        error: {
            path: req.originalUrl,
            message: "Your requested path is not available",
        },
    });
});
exports.default = app;
