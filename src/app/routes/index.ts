import express from 'express'
import { UserRoutes } from '../modules/User/user.route'
import { AdminRoutes } from '../modules/Admin/admin.route'
import { AuthRoutes } from '../modules/Auth/auth.route'
import { SpecialtiesRoutes } from '../modules/Specialties/specialties.route'
import { DoctorRoutes } from '../modules/Doctor/doctor.route'
import { PatientRoutes } from '../modules/Patient/patient.route'
const router = express.Router()

const moduleRoutes = [
    {
        path:'/user',
        route : UserRoutes
    },
    {
        path:'/admin',
        route : AdminRoutes
    },
    {
        path:'/auth',
        route : AuthRoutes
    },
    {
        path:'/specialties',
        route : SpecialtiesRoutes
    },
    {
        path:'/doctor',
        route : DoctorRoutes
    },
    {
        path: '/patient',
        route: PatientRoutes
    },
]
moduleRoutes.forEach((route)=>router.use(route?.path,route?.route))

export default router