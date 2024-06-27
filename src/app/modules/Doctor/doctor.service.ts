import { Doctor, Prisma, UserStatus } from "@prisma/client";
import prisma from "../../utils/prisma";
import { paginationHelpers } from "../../utils/paginationHelper";
import { TPaginationOptions } from "../../interface/interface";
import { TDoctorFilterRequest, TSpecialties } from "./doctor.interface";
import { doctorSearchableFields } from "./doctor.constant";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import asyncForEach from "../../utils/asyncForEach";

const getAllDoctorsFromDB = async (
  filters: TDoctorFilterRequest,
  options: TPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, specialties, ...filterData } = filters;

  const andConditions: Prisma.DoctorWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // doctor > doctorSpecialties > specialties -> title

  if (specialties && specialties.length > 0) {
    andConditions.push({
      doctorSpecialties: {
        some: {
          specialties: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
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

  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { averageRating: "desc" },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
    },
  });

  const total = await prisma.doctor.count({
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

const getDoctorByIdFromDB = async (id: string): Promise<Doctor | null> => {
  const result = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
      doctorSchedules: true,
      review: true,
    },
  });
  return result;
};

const updateDoctorIntoDB = async (id: string, payload: any) => {
  const { specialties, ...doctorData } = payload;

  const result = await prisma.$transaction(async (transactionClient) => {
    const updatedDoctor = await transactionClient.doctor.update({
      where: {
        id,
      },
      data: doctorData,
    });

    if (!updatedDoctor) {
      throw new Error("Unable to update Doctor");
    }

    if (specialties && specialties.length > 0) {
      const deleteSpecialities = specialties.filter(
        (speciality: any) => speciality.specialtiesId && speciality.isDeleted
      );

      const previousSpecialties = await transactionClient.doctorSpecialties.findMany({
        where: {
          doctorId: id,
        },
      });

      if (previousSpecialties) {
        const missingIds = previousSpecialties
          .filter((prevSpec) =>
            !specialties.some((someSpec: any) => someSpec.specialtiesId === prevSpec.specialtiesId)
          )
          .map((prevSpec) => ({
            specialtiesId: prevSpec.specialtiesId,
            isDeleted: true,
          }));

        if (missingIds.length > 0) {
          deleteSpecialities.push(...missingIds);
        }
      }

      const newSpecialities = specialties.filter(
        (speciality: any) => speciality.specialtiesId && !speciality.isDeleted
      );

      await asyncForEach(deleteSpecialities, async (deleteDoctorSpeciality: TSpecialties) => {
        await transactionClient.doctorSpecialties.deleteMany({
          where: {
            AND: [
              {
                doctorId: id,
              },
              {
                specialtiesId: deleteDoctorSpeciality.specialtiesId,
              },
            ],
          },
        });
      });

      await asyncForEach(newSpecialities, async (insertDoctorSpeciality: TSpecialties) => {
        const existingSpecialties = await prisma.doctorSpecialties.findFirst({
          where: {
            specialtiesId: insertDoctorSpeciality.specialtiesId,
            doctorId: id,
          },
        });

        if (!existingSpecialties) {
          await transactionClient.doctorSpecialties.create({
            data: {
              doctorId: id,
              specialtiesId: insertDoctorSpeciality.specialtiesId,
            },
          });
        }
      });
    }

    return updatedDoctor;
  });

  console.log(result); // Ensure result is logged for debugging
  return result; // Return result from transaction
};


const deleteDoctorFromDB = async (id: string): Promise<Doctor> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deleteDoctor = await transactionClient.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: deleteDoctor.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deleteDoctor;
  });
};

const getDoctorStatistics = async (
  doctorId: string,
  filter: { startDate?: Date; endDate?: Date }
) => {
  const { startDate, endDate } = filter;

  // Common date filter for all queries
  const dateFilter = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  // Appointment counts grouped by status
  const appointmentCountsByStatus = await prisma.appointment.groupBy({
    by: ["status"],
    where: {
      doctorId,
      ...dateFilter,
    },
    _count: {
      _all: true,
    },
  });

  // Doctor schedules count by month
  const doctorSchedulesByMonth = await prisma.doctorSchedules.groupBy({
    by: ["createdAt"],
    where: {
      doctorId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      _all: true,
    },
  });

  // Process the doctorSchedulesByMonth to group by month
  const schedulesByMonth = doctorSchedulesByMonth.reduce((acc, item) => {
    const month = new Date(item.createdAt).getMonth() + 1; // Get month (1-12)
    acc[month] = (acc[month] || 0) + item._count._all;
    return acc;
  }, {} as { [key: number]: number });

  // Unique patients count for lifetime
  const uniquePatientsCount = await prisma.appointment.findMany({
    where: {
      doctorId,
    },
    distinct: ["patientId"],
    select: {
      patientId: true,
    },
  });

  // Unique patients count by blood group
  const patientCountByBloodGroup = await prisma.patientHealthData.groupBy({
    by: ["bloodGroup"],
    _count: {
      _all: true,
    },
  });

  // Unique patients count by marital status
  const patientCountByMaritalStatus = await prisma.patientHealthData.groupBy({
    by: ["maritalStatus"],
    _count: {
      _all: true,
    },
  });

  // Unique patients count by gender
  const patientCountByGender = await prisma.patientHealthData.groupBy({
    by: ["gender"],
    _count: {
      _all: true,
    },
  });

  // Payment counts grouped by status
  const paymentCountsByStatus = await prisma.payment.groupBy({
    by: ["status"],
    where: {
      appointment: {
        doctorId,
        createdAt: dateFilter.createdAt,
      },
    },
    _count: {
      _all: true,
    },
  });

  // Review counts grouped by rating
  const reviewCountsByRating = await prisma.review.groupBy({
    by: ["rating"],
    where: {
      doctorId,
      ...dateFilter,
    },
    _count: {
      _all: true,
    },
  });

  // Group reviews by rating categories
  const reviewCountsByCategory = {
    "1-2": reviewCountsByRating
      .filter((r) => r.rating <= 2)
      .reduce((sum, r) => sum + (r._count?._all ?? 0), 0),
    "3": reviewCountsByRating
      .filter((r) => r.rating === 3)
      .reduce((sum, r) => sum + (r._count?._all ?? 0), 0),
    "4-5": reviewCountsByRating
      .filter((r) => r.rating >= 4)
      .reduce((sum, r) => sum + (r._count?._all ?? 0), 0),
  };

  return {
    appointmentCountsByStatus,
    doctorSchedulesByMonth: schedulesByMonth,
    uniquePatientsCount,
    patientCountByBloodGroup,
    patientCountByMaritalStatus,
    patientCountByGender,
    paymentCountsByStatus,
    reviewCountsByCategory,
  };
};

export const DoctorService = {
  getDoctorByIdFromDB,
  getAllDoctorsFromDB,
  updateDoctorIntoDB,
  deleteDoctorFromDB,
  getDoctorStatistics,
};
