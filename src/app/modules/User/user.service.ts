import {
  Admin,
  Doctor,
  Patient,
  Prisma,
  PrismaClient,
  UserRole,
  UserStatus,
} from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../../utils/prisma";
import { fileUploader } from "../../utils/fileUploader";
import { TAuthUser, TFile, TPaginationOptions } from "../../interface/interface";
import { Request } from "express";
import { paginationHelpers } from "../../utils/paginationHelper";
import { userSearchableFields } from "./user.constant";
import AppError from "../../errors/AppError";
const createAdminIntoDB = async (req: Request): Promise<Admin> => {
  const file = req.file as TFile;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
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

const createDoctorIntoDB = async (req: Request): Promise<Doctor> => {
  const file = req.file as TFile;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url;
  }
  const hashedPassword: string = await bcrypt.hash(req?.body?.password, 10);
  const userData = {
    email: req?.body?.doctor?.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    const createdUserData = await transactionClient.user.create({
      data: userData,
    });
    const createdDoctorData = await transactionClient.doctor.create({
      data: req?.body?.doctor,
    });
    return createdDoctorData;
  });

  return result;
};
const createPatientIntoDB = async (req: Request): Promise<Patient> => {
  const file = req.file as TFile;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.patient.profilePhoto = uploadToCloudinary?.secure_url;
  }
  const hashedPassword: string = await bcrypt.hash(req?.body?.password, 10);
  const userData = {
    email: req?.body?.patient?.email,
    password: hashedPassword,
    role: UserRole.PATIENT,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    const createdUserData = await transactionClient.user.create({
      data: userData,
    });
    const createdPatientData = await transactionClient.patient.create({
      data: req?.body?.patient,
    });
    return createdPatientData;
  });

  return result;
};

const getUsersfromDB = async (query: any, options: TPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const { searchTerm, ...remainingQueries } = query;
  const andConditions: Prisma.UserWhereInput[] = [];
  if (query.searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
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
          equals: (remainingQueries as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const result = await prisma.user.findMany({
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
    select: {
      id: true,
      email: true,
      role: true,
      needsPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      patient: true,
      doctor: true,
    },
    // include:{admin:true,patient:true,doctor:true}
  });
  const total = await prisma.user.count({
    where: whereConditions,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const changeProfileStatus = async (id: string, status: UserRole) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const updateUserStatus = await prisma.user.update({
    where: {
      id,
    },
    data: status,
  });

  return updateUserStatus;
};

const getMyProfileFromDB = async (user: TAuthUser) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needsPasswordChange: true,
      role: true,
      status: true,
    },
  });
  let profileInfo;
  if (userInfo?.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.findUniqueOrThrow({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo?.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.findUniqueOrThrow({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo?.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo?.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.findUniqueOrThrow({
      where: {
        email: userInfo.email,
      },
    });
  }
  return { ...userInfo, ...profileInfo };
};

const updateMyProfileIntoDB = async (user: TAuthUser, req: Request) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needsPasswordChange: true,
      role: true,
      status: true,
      
    },
  });


const file = req.file as TFile
if(file){
  const uploadToCloudinary = await fileUploader.uploadToCloudinary(file)
  req.body.profilePhoto = uploadToCloudinary?.secure_url
}

  let profileInfo;
  if (userInfo?.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo?.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data:  req.body,
    });
  } else if (userInfo?.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.update({
      where: {
        email: userInfo.email,
      },
      data:  req.body,
    });
  } else if (userInfo?.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.update({
      where: {
        email: userInfo.email,
      },
      data:  req.body,
    });
  }

  return {...profileInfo}
};
export const userService = {
  createAdminIntoDB,
  createDoctorIntoDB,
  createPatientIntoDB,
  getUsersfromDB,
  changeProfileStatus,
  getMyProfileFromDB,
  updateMyProfileIntoDB,
};
