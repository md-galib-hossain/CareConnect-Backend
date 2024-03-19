import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const findAdminsfromDB = async (query: Record<string, unknown>) => {
  const andConditions: Prisma.AdminWhereInput[] = [];
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: query.searchTerm as string,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: query.searchTerm as string,
            mode: "insensitive",
          },
        },
      ],
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
  });
  return result;
};

export const AdminServices = {
  findAdminsfromDB,
};
