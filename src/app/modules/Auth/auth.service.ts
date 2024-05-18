import prisma from "../../utils/prisma";
import * as bcrypt from "bcrypt";
import { generateToken, verifyToken } from "./auth.utils";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { UserStatus } from "@prisma/client";
import config from "../../config";
import emailSender from "../../utils/emailsender";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
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

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload?.email,
      status: UserStatus.ACTIVE,
    },
  });
  const resetPassToken = generateToken(
    { email: userData.email, role: userData.role },
    config.JWT.RESET_PASSWORD_TOKEN as Secret,
    config.JWT.RESET_PASSWORD_TOKEN_EXPIRES_IN as string
  );
  console.log(resetPassToken);
  const resetPassLink =
    config.JWT.RESET_PASSWORD_LINK +
    `?id=${userData?.id}&token=${resetPassToken}`;
  //http://localhost:5000/reset-pass
  console.log(resetPassLink);
  await emailSender(
    userData?.email,
    `
    <div>
      <p> Dear User,</p>
      <p> Your Password reset link 
      <a href=${resetPassLink}>
<button>Reset Password</button>
      </a>
      </p>
    </div>
    `
  );
};
const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload?.id,
      status: UserStatus.ACTIVE,
    },
  });
  const isValidToken = verifyToken(
    token,
    config.JWT.RESET_PASSWORD_TOKEN as string
  );
  console.log(isValidToken);
  if (!isValidToken) {
    throw new AppError(httpStatus.FORBIDDEN, "invalid token");
  }

  const hashedPassword: string = await bcrypt.hash(payload?.password, 10);

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      needsPasswordChange: false,
    },
  });
  return  {
    message: "Password recovered successfully",
  }
 
};

export const AuthServices = {
  loginUser,
  refreshToken,
  changePasswordIntoDB,
  forgotPassword,
  resetPassword,
};
