import { AppointmentStatus, PaymentStatus, Prescription } from "@prisma/client";
import { TAuthUser, TPaginationOptions } from "../../interface/interface";
import prisma from "../../utils/prisma";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { paginationHelpers } from "../../utils/paginationHelper";

const createPrescriptionIntoDB = async (
  payload: Partial<Prescription>,
  user: TAuthUser
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      doctor: true,
    },
  });

  if (!(user?.email === appointmentData?.doctor.email)) {
    throw new AppError(httpStatus.BAD_REQUEST, "This is not your appointment");
  }
  const result = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      instructions: payload.instructions as string,
      followUpDate: payload.followUpDate || null || undefined,
    },
    include: {
      patient: true,
    },
  });
  return result;
};

const getMyPrescriptionFromDB = async (
  user: TAuthUser,
  options: TPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const result = await prisma.prescription.findMany({
    where: {
      patient: {
        email: user?.email,
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    },
  });
  const total = await prisma.prescription.count({
    where: {
        patient: {
          email: user?.email,
        },
      },
  })
  return {
    meta : {
        total,
        page,
        limit
    },
    data : result
  };
};
export const PrescriptionService = {
  createPrescriptionIntoDB,
  getMyPrescriptionFromDB,
};
