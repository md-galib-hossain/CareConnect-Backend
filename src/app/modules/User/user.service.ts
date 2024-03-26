import { Prisma, PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../../utils/prisma";
import { fileUploader } from "../../utils/fileUploader";
const createAdminIntoDB = async (req: any) => {
  const file = req.file;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
    console.log(req?.body);
  }
  const hashedPassword: string = await bcrypt.hash(req?.body?.password, 10);
  const userData = {
    email: req?.body?.admin?.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    const createdUserData = await transactionClient.user.create({
      data: userData,
    });
    const createdAdminData = await transactionClient.admin.create({
      data: req?.body?.admin,
    });
    return createdAdminData;
  });

  return result;
};
export const userService = {
  createAdminIntoDB,
};
