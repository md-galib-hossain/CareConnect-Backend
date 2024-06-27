import { Request } from "express";
import { fileUploader } from "../../utils/fileUploader";
import prisma from "../../utils/prisma";
import { Prisma, Specialties } from "@prisma/client";
import { TFilterRequest } from "../Schedule/schedule.interface";
import {
  TGenericResponse,
  TPaginationOptions,
} from "../../interface/interface";
import { paginationHelpers } from "../../utils/paginationHelper";
import { specialtiesSearchableFields } from "./specialties.constant";

const createSpecialtiesIntoDB = async (req: Request) => {
  const file = req.file;
  if (file) {
    const uploadToClodinary = await fileUploader.uploadToCloudinary(file);
    req.body.icon = uploadToClodinary?.secure_url;
  }
  const result = await prisma.specialties.create({
    data: req.body,
  });
  return result;
};
const getAllSpecialtiesFromDB = async (
  filters: any,
  options: TPaginationOptions
): Promise<TGenericResponse<Specialties[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm } = filters;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: specialtiesSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereConditions: Prisma.SpecialtiesWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.specialties.findMany({
    where: {
      ...whereConditions,
      isDeleted: false,
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { title: "asc" },
  });
  const total = await prisma.specialties.count({
    where: {
      ...whereConditions,
    },
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
const deleteSpecialtiesFromDB = async (id: string): Promise<Specialties> => {
  const result = await prisma.specialties.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });
  return result;
};

export const SpecialtiesService = {
  createSpecialtiesIntoDB,
  getAllSpecialtiesFromDB,
  deleteSpecialtiesFromDB,
};
