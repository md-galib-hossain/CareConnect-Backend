import prisma from "../../utils/prisma"

const createDoctorScheduleIntoDB =async(user: any, payload: {scheduleIds : string[]})=>{

const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
        email : user.email
    }
})

const doctorScheduleData = payload.scheduleIds.map(scheduleId=> ({
   
        doctorId : doctorData?.id,
        scheduleId 
  
} ))
const result = await prisma.doctorSchedules.createMany({
    data : doctorScheduleData
})
return result
}
export const DoctorScheduleService = {createDoctorScheduleIntoDB}