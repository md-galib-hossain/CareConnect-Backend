import express from 'express'
import { PrescriptionController } from './prescription.controller'
import auth from '../../middlewares/auth'
import { UserRole } from '@prisma/client'

const router = express.Router()
router.post('/',
auth(UserRole.DOCTOR),
PrescriptionController.createPrescription)


router.get('/my-prescription',
auth(UserRole.PATIENT),
PrescriptionController.getMyPrescription)


export const PrescriptionRoutes = router