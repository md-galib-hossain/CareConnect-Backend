import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { DoctorScheduleController } from './doctorSchedule.controller';

const router = express.Router();

router.post(
    '/',
    auth(UserRole.DOCTOR),
    // validateRequest(DoctorScheduleValidation.create),
    DoctorScheduleController.createDoctorSchedule
);
export const DoctorScheduleRoutes = router;