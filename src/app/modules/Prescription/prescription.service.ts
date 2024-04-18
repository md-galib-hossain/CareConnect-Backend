import { AppointmentStatus, PaymentStatus } from "@prisma/client"
import { TAuthUser } from "../../interface/interface"
import prisma from "../../utils/prisma"

const createPrescriptionIntoDB = async(payload:any,user : TAuthUser)=>{
const appointmentData = await prisma.appointment.findUnique({
    where:{
        id:payload.appointmentId,
        status: AppointmentStatus.COMPLETED,
        paymentStatus : PaymentStatus.PAID
    }
})
console.log(appointmentData)

}
export const PrescriptionService = {createPrescriptionIntoDB}