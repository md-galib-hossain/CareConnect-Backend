import { AppointmentStatus, PaymentStatus, Prisma, UserRole } from "@prisma/client";
import { TAuthUser, TPaginationOptions } from "../../interface/interface";
import { paginationHelpers } from "../../utils/paginationHelper";
import prisma from "../../utils/prisma";
import { v4 as uuidv4 } from "uuid";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
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
        amount: doctorData?.appointmentFee,
        transactionId: transactionId,
      },
    });

    return appointmentData;
  });
  return result;
};

const getMyAppointmentFromDB = async (
  user: TAuthUser,
  filters: any,
  options: TPaginationOptions
) => {
  console.log(user, filters, options);
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { ...filterData } = filters;
  const andConditions: Prisma.AppointmentWhereInput[] = [];
  if (user?.role === UserRole.PATIENT) {
    andConditions.push({
      patient: {
        email: user?.email,
      },
    });
  } else if (user?.role === UserRole.DOCTOR) {
    andConditions.push({
      doctor: {
        email: user?.email,
      },
    });
  }
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include:
      user?.role === UserRole.PATIENT
        ? { doctor: true, schedule: true,review : true }
        : {
            patient: {
              include: { medicalReport: true, patientHealthData: true },
            },
            schedule: true,
          },
  });

  const total = await prisma.appointment.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

//*get all appointments
const getAllAppointmentFromDB = async (
  filters: any,
  options: TPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { patientEmail, doctorEmail, ...filterData } = filters;
  const andConditions = [];

  if (patientEmail) {
    andConditions.push({
      patient: {
        email: patientEmail,
      },
    });
  } else if (doctorEmail) {
    andConditions.push({
      doctor: {
        email: doctorEmail,
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        return {
          [key]: {
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }

  // console.dir(andConditions, { depth: Infinity })
  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "desc",
          },
    include: {
      doctor: true,
      patient: true,
    },
  });
  const total = await prisma.appointment.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const changeAppointmentStatusIntoDB = async (
  appointmentId: string,
  status: AppointmentStatus,user : TAuthUser
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
    },
    include:{
      doctor: true
    }
  });

  if(user?.role === UserRole.DOCTOR){
    if(!(user?.email === appointmentData.doctor.email)){
      throw new AppError(httpStatus.BAD_REQUEST,"This is not your appointment")
    }
  }
  const result = await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status,
    },
  });
  return result
};

const cancelUnpaidAppointments = async ()=>{
const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000)
//getting appointments which are older than 30 mins
const UnpaidAppointments = await prisma.appointment.findMany({
  where:{
    createdAt:{
      lte: 
        thirtyMinAgo
      
    },
    paymentStatus : PaymentStatus.UNPAID
  }
})
//getting the unpaid appointment ids which are 30 min old
const appointmenIdsToCancel = UnpaidAppointments.map(appointment => appointment.id)
 await prisma.$transaction(async(tx)=>{
  await tx.payment.deleteMany({
    where:{
      appointmentId : {
        in:appointmenIdsToCancel
      }
    }
  })
  await tx.appointment.deleteMany({
    where:{
      id: {
        in:appointmenIdsToCancel
      }
    }
  })

  for(const UnpaidAppointment of UnpaidAppointments){
    await tx.doctorSchedules.updateMany({
      where:{
       doctorId : UnpaidAppointment.doctorId,
       scheduleId : UnpaidAppointment.scheduleId
      },
      data: {
        isBooked : false
      }
    })
  }

})
}
export const AppointmentService = {
  createAppointmentIntoDB,
  getMyAppointmentFromDB,
  getAllAppointmentFromDB,
  changeAppointmentStatusIntoDB,cancelUnpaidAppointments
};
