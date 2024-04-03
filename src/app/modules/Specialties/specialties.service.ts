import { Request } from "express";
import { fileUploader } from "../../utils/fileUploader";
import prisma from "../../utils/prisma";
import { Specialties } from "@prisma/client";

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
const getAllSpecialtiesFromDB = async (): Promise<Specialties[]> => {
    return await prisma.specialties.findMany();
}
const deleteSpecialtiesFromDB = async (id: string): Promise<Specialties> => {
    const result = await prisma.specialties.delete({
        where: {
            id,
        },
    });
    return result;
};

export const SpecialtiesService = {
  createSpecialtiesIntoDB,getAllSpecialtiesFromDB,deleteSpecialtiesFromDB
};
