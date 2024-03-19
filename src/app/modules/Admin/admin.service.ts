import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const getAdminsfromDB = async (query: Record<string, unknown>) => {
const {searchTerm,...remainingQueries} = query
  const andConditions: Prisma.AdminWhereInput[] = [];
  const adminSearchableFields = ['name', 'email']
  if (query.searchTerm) {
    andConditions.push({
      OR: adminSearchableFields.map(field=> ({
         [field]: {
            contains: query.searchTerm as string,
            mode: "insensitive",
        }
      }))
    });
  }

  if(Object.keys(remainingQueries).length > 0){

    andConditions.push({
        AND : Object.keys(remainingQueries).map(key=>({
            [key] : {
                equals : remainingQueries[key]
            }
        }))
    })
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
    getAdminsfromDB,
};
