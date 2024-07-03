"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = require("../modules/User/user.route");
const admin_route_1 = require("../modules/Admin/admin.route");
const auth_route_1 = require("../modules/Auth/auth.route");
const specialties_route_1 = require("../modules/Specialties/specialties.route");
const doctor_route_1 = require("../modules/Doctor/doctor.route");
const patient_route_1 = require("../modules/Patient/patient.route");
const schedule_route_1 = require("../modules/Schedule/schedule.route");
const doctorSchedule_route_1 = require("../modules/DoctorSchedule/doctorSchedule.route");
const appointment_route_1 = require("../modules/Appointment/appointment.route");
const payment_route_1 = require("../modules/Payment/payment.route");
const prescription_route_1 = require("../modules/Prescription/prescription.route");
const review_route_1 = require("../modules/Review/review.route");
const meta_route_1 = require("../modules/Meta/meta.route");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/user',
        route: user_route_1.UserRoutes
    },
    {
        path: '/admin',
        route: admin_route_1.AdminRoutes
    },
    {
        path: '/auth',
        route: auth_route_1.AuthRoutes
    },
    {
        path: '/specialties',
        route: specialties_route_1.SpecialtiesRoutes
    },
    {
        path: '/doctor',
        route: doctor_route_1.DoctorRoutes
    },
    {
        path: '/patient',
        route: patient_route_1.PatientRoutes
    }, {
        path: '/schedule',
        route: schedule_route_1.ScheduleRoutes
    },
    {
        path: '/doctor-schedule',
        route: doctorSchedule_route_1.DoctorScheduleRoutes
    },
    {
        path: '/appointment',
        route: appointment_route_1.AppointmentRoutes
    },
    {
        path: '/payment',
        route: payment_route_1.PaymentRoutes
    },
    {
        path: '/prescription',
        route: prescription_route_1.PrescriptionRoutes
    },
    {
        path: '/review',
        route: review_route_1.ReviewRoutes
    },
    {
        path: '/meta',
        route: meta_route_1.MetaRoutes
    }
];
moduleRoutes.forEach((route) => router.use(route === null || route === void 0 ? void 0 : route.path, route === null || route === void 0 ? void 0 : route.route));
exports.default = router;
