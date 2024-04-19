import { Doctor, Prisma, UserStatus } from "@prisma/client";
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
    },
  });
  return result;
};

const updateDoctorIntoDB = async (id: string, payload: any) => {
  const { specialties, ...doctorData } = payload;
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

 await prisma.$transaction(async (transactionClient) => {
    await transactionClient.doctor.update({
      where: {
        id,
      },
      data: doctorData,
     
    });

    if (specialties && specialties.length > 0) {
      //delete specialties
      const deleteSpecialtiesIds = specialties.filter(
        (specialty: any) => specialty.isDeleted
      );
      for (const specialty of deleteSpecialtiesIds) {
       
          await transactionClient.doctorSpecialties.deleteMany({
            where: {
              doctorId: doctorInfo?.id,
              specialtiesId: specialty?.specialtiesId,
            },
          });
      }

      //create specialties
      const createSpecialtiesIds = specialties.filter(
        (specialty: any) => !specialty.isDeleted
      );

      for (const specialty of createSpecialtiesIds) {
       
          await transactionClient.doctorSpecialties.create({
            data: {
              doctorId: doctorInfo?.id,
              specialtiesId: specialty.specialtiesId,
            },
          });
      }
    }

  });

const result = await prisma.doctor.findUnique({
  where : {
    id: doctorInfo.id
  },include:{
    doctorSpecialties:{
      include : {
        specialties: true
      }
    }
  }
})
return result
};

const deleteDoctorFromDB = async (id: string): Promise<Doctor> => {
  return await prisma.$transaction(async transactionClient => {
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

export const DoctorService = {
  getDoctorByIdFromDB,
  getAllDoctorsFromDB,
  updateDoctorIntoDB,deleteDoctorFromDB
};
