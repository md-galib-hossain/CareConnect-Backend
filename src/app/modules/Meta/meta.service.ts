import { PaymentStatus, UserRole } from "@prisma/client";
import { TAuthUser } from "../../interface/interface";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import prisma from "../../utils/prisma";

const getDashboardMetaDataFromDB = async (user: TAuthUser) => {
  let metaData;
  switch (user?.role) {
    case UserRole.SUPER_ADMIN:
      metaData = getSuperAdminMetaData();
      break;
    case UserRole.ADMIN:
      metaData = getAdminMetaData();
      break;
    case UserRole.DOCTOR:
      metaData = getDoctorMetaData(user as TAuthUser);
      break;
    case UserRole.PATIENT:
      metaData = getPatientMetaData(user as TAuthUser);
      break;
    default:
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid user");
  }
  return metaData
};

const getSuperAdminMetaData = async () => {
  const appointmenCount = await prisma.appointment.count();
  const patientCount = await prisma.patient.count();
  const doctorCount = await prisma.doctor.count();
  const paymentCount = await prisma.payment.count();
  const adminCount = await prisma.admin.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });
  return {
    appointmenCount,
    doctorCount,
    paymentCount,
    patientCount,
    totalRevenue,
    adminCount,
  };
};
const getAdminMetaData = async () => {
  const appointmenCount = await prisma.appointment.count();
  const patientCount = await prisma.patient.count();
  const doctorCount = await prisma.doctor.count();
  const paymentCount = await prisma.payment.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });
  return {
    appointmenCount,
    doctorCount,
    paymentCount,
    patientCount,
    totalRevenue,
  };
};
const getDoctorMetaData = async (user: TAuthUser) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      doctorId: doctorData.id,
    },
  });
  const patientCount = await prisma.appointment.groupBy({
    by: ["patientId"],

    where: {
      doctorId: doctorData.id,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      doctorId: doctorData.id,
    },
  });
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      appointment: {
        doctorId: doctorData.id,
      },
      status: PaymentStatus.PAID,
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
    where: {
      doctorId: doctorData.id,
    },
  });

  //formated appointment status distributions
  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map((count: any) => ({
      status: count.status,
      count: Number(count._count.id),
    }));
//   console.dir(formattedAppointmentStatusDistribution, { depth: "infinity" });
  return {
    formattedAppointmentStatusDistribution,
    totalRevenue,
    reviewCount,
    patientCount : patientCount.length,
    appointmentCount,
  };
};

//* patient
const getPatientMetaData = async (user: TAuthUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      patientId: patientData.id,
    },
  });
  const prescriptionCount = await prisma.prescription.count({
    where: {
      patientId: patientData.id,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      patientId: patientData.id,
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
    where: {
      patientId: patientData.id,
    },
  });

  //formated appointment status distributions
  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map((count: any) => ({
      status: count.status,
      count: Number(count._count.id),
    }));
  return {
    formattedAppointmentStatusDistribution,
    reviewCount,
    appointmentCount,
    prescriptionCount,
  };
};

export const MetaService = { getDashboardMetaDataFromDB };
