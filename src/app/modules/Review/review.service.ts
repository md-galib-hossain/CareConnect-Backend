import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TAuthUser, TPaginationOptions } from "../../interface/interface";
import prisma from "../../utils/prisma";
import { paginationHelpers } from "../../utils/paginationHelper";
import { Prisma } from "@prisma/client";

const createReviewIntoDB = async (payload: any, user: TAuthUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      patientId: patientData?.id,
    },
  });
  console.log(appointmentData);
  if (!(patientData.id === appointmentData.patientId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "This is not your appointment");
  }
  return await prisma.$transaction(async (tx) => {
    const result = await tx.review.create({
        data: {
          appointmentId: appointmentData.id,
          doctorId: appointmentData.doctorId,
          patientId: appointmentData.patientId,
          rating: payload.rating,
          comment: payload.comment,
        },
      });
    const averageRating = await tx.review.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        doctorId: appointmentData.doctorId,
      },
    });
    await tx.doctor.update({
      where: {
        id: appointmentData.doctorId,
      },
      data: {
        averageRating: averageRating._avg.rating as number,
      },
    });
  });
};

const getAllReviewsFromDB = async (
  filters: any,
  options: TPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { patientEmail, doctorEmail } = filters;
  const andConditions = [];

  if (patientEmail) {
    andConditions.push({
      patient: {
        email: patientEmail,
      },
    });
  }

  if (doctorEmail) {
    andConditions.push({
      doctor: {
        email: doctorEmail,
      },
    });
  }

  const whereConditions: Prisma.ReviewWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.review.findMany({
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
      //appointment: true,
    },
  });
  const total = await prisma.review.count({
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
export const ReviewService = { createReviewIntoDB, getAllReviewsFromDB };
