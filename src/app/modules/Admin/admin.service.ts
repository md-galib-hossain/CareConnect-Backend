import { Prisma, PrismaClient } from "@prisma/client";
import { adminSearchableFields } from "./admin.constant";
import { paginationHelpers } from "../../utils/paginationHelper";
import prisma from "../../utils/prisma";




const getAdminsfromDB = async (
  query: Record<string, unknown>,
  options: any
) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(options);

  const { searchTerm, ...remainingQueries } = query;
  const andConditions: Prisma.AdminWhereInput[] = [];
  if (query.searchTerm) {
    andConditions.push({
      OR: adminSearchableFields.map((field) => ({
        [field]: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(remainingQueries).length > 0) {
    andConditions.push({
      AND: Object.keys(remainingQueries).map((key) => ({
        [key]: {
          equals: remainingQueries[key],
        },
      })),
    });
  }
  const whereConditions: Prisma.AdminWhereInput = {
    AND: andConditions,
  };

  const result = await prisma.admin.findMany({
    // where : {
    //     name :{
    //         contains : query.searchTerm as string,
    //         mode: 'insensitive'
    //     }
    // }
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });
  return result;
};

export const AdminServices = {
  getAdminsfromDB,
};
