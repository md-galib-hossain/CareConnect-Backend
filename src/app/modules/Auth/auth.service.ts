import prisma from "../../utils/prisma";
import * as bcrypt from "bcrypt";
import { generateToken, verifyToken } from "./auth.utils";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { UserStatus } from "@prisma/client";
import config from "../../config";
import emailSender from "../../utils/emailsender";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { jwtHelpers } from "../../utils/jwtHelpers";
const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  const isCorrectPassword = await bcrypt.compare(
    payload?.password,
    userData.password
  );
  if (!isCorrectPassword) {
    throw new Error("Invalid password");
  }
  const accessToken = generateToken(
    {
      email: userData?.email,
      role: userData?.role,
      status: userData?.status,
      id: userData?.id,
      isDeleted: userData?.isDeleted,
    },
    config.JWT.ACCESS_TOKEN_SECRET!,
    config.JWT.ACCESS_TOKEN_EXPIRES_IN!
  );
  const refreshToken = generateToken(
    {
      email: userData?.email,
      role: userData?.role,
      status: userData?.status,
      id: userData?.id,
      isDeleted: userData?.isDeleted,
    },
    config.JWT.REFRESH_TOKEN_SECRET!,
    config.JWT.REFRESH_TOKEN_EXPIRES_IN!
  );
  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData?.needsPasswordChange,
  };
};
//refresh token start
const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = verifyToken(token, config.JWT.REFRESH_TOKEN_SECRET!);
    console.log(decodedData);
  } catch (err) {
    console.log(err)
    throw new Error("You are not authorized");
  }
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const accessToken = generateToken(
    {
      email: userData?.email,
      role: userData?.role,
      status: userData?.status,
      id: userData?.id,
      isDeleted: userData?.isDeleted,
    },
    config.JWT.ACCESS_TOKEN_SECRET!,
    config.JWT.ACCESS_TOKEN_EXPIRES_IN!
  );
  return {
    accessToken,

    needPasswordChange: userData?.needsPasswordChange,
  };
};
//refresh token end
const changePasswordIntoDB = async (user: any, payload: any) => {
  const userData = await prisma.user.findFirstOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword = await bcrypt.compare(
    payload?.oldPassword,
    userData?.password
  );
  if (!isCorrectPassword) {
    throw new Error("password incorrect!");
  }

  const hashedPassword: string = await bcrypt.hash(payload?.newPassword, 10);

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      needsPasswordChange: false,
    },
  });
  return {
    message: "Password changed successfully",
  };
};

const forgotPassword = async (payload: any) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email : payload?.email,
      status: UserStatus.ACTIVE
    }
  });
  if (!isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User does not exist!")
  }

  const passResetToken = await jwtHelpers.createPasswordResetToken({
      id: isUserExist.id
  });

  const resetLink: string = config.JWT.RESET_PASSWORD_LINK + `?id=${isUserExist.id}&token=${passResetToken}`
  console.log({resetLink})

  await emailSender(payload?.email, `
    <div>
      <p>Dear ${isUserExist.role},</p>
      <p>Your password reset link: <a href=${resetLink}><button>RESET PASSWORD<button/></a></p>
      <p>Thank you</p>
    </div>
`);
}
const resetPassword = async (payload: { id: string, newPassword: string }, token: string) => {

  const isUserExist = await prisma.user.findUnique({
      where: {
          id: payload.id,
          status: UserStatus.ACTIVE
      }
  })

  if (!isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User not found!")
  }

  const isVarified = jwtHelpers.verifyToken(token, config.JWT.RESET_PASSWORD_TOKEN as string);

  if (!isVarified) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Something went wrong!")
  }

  const password = await bcrypt.hash(payload.newPassword, 10);

  await prisma.user.update({
      where: {
          id: payload.id
      },
      data: {
          password
      }
  })
}

export const AuthServices = {
  loginUser,
  refreshToken,
  changePasswordIntoDB,
  forgotPassword,
  resetPassword,
};
