import { Doctor, Prisma } from "@prisma/client";
import prisma from "../../utils/prisma";
import { paginationHelpers } from "../../utils/paginationHelper";
import { TPaginationOptions } from "../../interface/interface";
import { TDoctorFilterRequest } from "./doctor.interface";
import { doctorSearchableFields } from "./doctor.constant";

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
          specialities: {
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
        : { createdAt: "desc" },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
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
          specialities: true,
        },
      },
    },
  });
  return result;
};

const updateDoctorIntoDB = async (id: string, payload: any) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const updatedDoctorData = await prisma.doctor.update({
    where: {
      id,
    },
    data: payload,
    include:{
        doctorSpecialties:true
    }
  });
  return updatedDoctorData
};

export const DoctorService = { getDoctorByIdFromDB, getAllDoctorsFromDB,updateDoctorIntoDB };
