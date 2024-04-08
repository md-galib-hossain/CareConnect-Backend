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
router.get(
    '/',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
    DoctorScheduleController.getAllDoctorSchedule
);
router.get(
    '/my-schedule',
    auth(UserRole.DOCTOR),
    DoctorScheduleController.getMySchedule
)
router.delete(
    '/:id',
    auth(UserRole.DOCTOR),
    DoctorScheduleController.deleteDoctorSchedule
);

export const DoctorScheduleRoutes = router;