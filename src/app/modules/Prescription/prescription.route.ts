import express from 'express'
import { PrescriptionController } from './prescription.controller'
import auth from '../../middlewares/auth'
import { UserRole } from '@prisma/client'

const router = express.Router()
router.post('/',
auth(UserRole.DOCTOR),
PrescriptionController.createPrescription)
export const PrescriptionRoutes = router