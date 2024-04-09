import { TAuthUser } from "../../interface/interface";
import prisma from "../../utils/prisma";
import { v4 as uuidv4 } from "uuid";
const createAppointmentIntoDB = async (user: TAuthUser, payload: any) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });
  console.log(payload);

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload?.doctorId,
    },
  });

  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorData?.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });
  const videoCallingId: string = uuidv4();
  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientData?.id,
        doctorId: doctorData?.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData?.id,
          scheduleId: payload?.scheduleId,
        },
      },
      data: {
        isBooked: true,
        appointmentId: appointmentData?.id,
      },
    });

    //generate transaction id : careconnect-9/4/2024
    const today = new Date();

    const transactionId =
      "Care-Connect" +
      today.getFullYear() +
      "-" +
      today.getMonth() +
      "-" +
      today.getDay() +
      "-" +
      today.getHours() +
      "-" +
      today.getMinutes();
    await tx.payment.create({
      data: {
        appointmentId: appointmentData?.id,
        amount: doctorData?.appoinmentFee,
        transactionId: transactionId,
      },
    });

    return appointmentData;
  });
  return result;
};
export const AppointmentService = {
  createAppointmentIntoDB,
};
