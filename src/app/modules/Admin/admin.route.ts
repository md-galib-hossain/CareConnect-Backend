import express from 'express'
import { AdminControllers } from './admin.controller'
const router = express.Router()

router.get('/',AdminControllers.getAdmins)

export const AdminRoutes = router