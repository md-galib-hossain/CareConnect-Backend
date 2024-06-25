import express from 'express'
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AppointmentValidation } from './appointment.validation';
import { UserRole } from '@prisma/client';
import { AppointmentController } from './appointment.controller';
const router = express.Router()
router.post(
    '/',
    auth(UserRole.PATIENT),
    validateRequest(AppointmentValidation.createAppointment),
    AppointmentController.createAppointment
);
router.get(
    '/my-appointments',
    auth(UserRole.PATIENT,UserRole.DOCTOR),
    AppointmentController.getMyAppointment
);
router.get(
    '/',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    AppointmentController.getAllAppointment
);
router.patch(
    '/status/:appointmentId',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN,UserRole.DOCTOR),
    AppointmentController.changeAppointmentStatus
);
export const AppointmentRoutes = router