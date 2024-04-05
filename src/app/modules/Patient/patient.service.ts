import { Patient, Prisma } from "@prisma/client";
import { TPaginationOptions } from "../../interface/interface";
import { paginationHelpers } from "../../utils/paginationHelper";
import { patientSearchableFields } from "./patient.constant";
import { TPatientFilterRequest } from "./patient.interface";
import prisma from "../../utils/prisma";

const getAllPatientFromDB = async (
  filters: TPatientFilterRequest,
  options: TPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
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
  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.PatientWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.patient.findMany({
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
      medicalReport: true,
      patientHealthData: true,
    },
  });
  const total = await prisma.patient.count({
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

const getByPatientIdFromDB = async (id: string): Promise<Patient | null> => {
  const result = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      medicalReport: true,
      patientHealthData: true,
    },
  });
  return result;
};

const updatePatientIntoDB = async (id: string, payload: any) => {
  const { patientHealthData, medicalReport, ...patientData } = payload;
  console.log(patientHealthData, medicalReport, patientData);
  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const updatedPatient = await transactionClient.patient.update({
      where: {
        id,
      },
      data: patientData,
      include: {
        patientHealthData: true,
        medicalReport: true,
      },
    });
    //create or update patient health data

    if (patientHealthData) {
      const healthData = await transactionClient.patientHealthData.upsert({
        where: {
          patientId: patientInfo.id,
        },
        update: patientHealthData,
        create: { ...patientHealthData, patientId: patientInfo.id },
      });
    }

    if (medicalReport) {
      const report = await transactionClient.medicalReport.create({
        data: { ...medicalReport, patientId: patientInfo.id },
      });
    }
  });
const responseData = await prisma.patient.findUnique({
    where: {
        id : patientInfo.id,
    },
    include : {
        patientHealthData: true,
        medicalReport: true,
    }
})
    return responseData;
};

export const PatientService = {
  getAllPatientFromDB,
  getByPatientIdFromDB,
  updatePatientIntoDB,
};
