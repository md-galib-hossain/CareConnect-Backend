import express from 'express'
import { UserRoutes } from '../modules/User/user.route'
import { AdminRoutes } from '../modules/Admin/admin.route'
import { AuthRoutes } from '../modules/Auth/auth.route'
import { SpecialtiesRoutes } from '../modules/Specialties/specialties.route'
import { DoctorRoutes } from '../modules/Doctor/doctor.route'
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
    }
]
moduleRoutes.forEach((route)=>router.use(route?.path,route?.route))

export default router