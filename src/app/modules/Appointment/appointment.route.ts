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
    // validateRequest(AppointmentValidation.createAppointment),
    AppointmentController.createAppointment
);
export const AppointmentRoutes = router