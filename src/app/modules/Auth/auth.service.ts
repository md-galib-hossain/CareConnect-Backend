import prisma from "../../utils/prisma";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });
  const isCorrectPassword = await bcrypt.compare(
    payload?.password,
    userData.password
  );
  if (!isCorrectPassword) {
    throw new Error("Invalid password");
  }
  const accessToken = jwt.sign(
    {
      email: userData.email,
      role: userData.role,
      status: userData.status,
      id: userData.id,
      isDeleted: userData.isDeleted,
    },
    "abcdefg",
    {
      algorithm: "HS256",
      expiresIn: "5m",
    }
  );
  const refreshToken = jwt.sign(
    {
      email: userData.email,
      role: userData.role,
      status: userData.status,
      id: userData.id,
      isDeleted: userData.isDeleted,
    },
    "abcdefghjklmnopqrstuvwxyz",
    {
      algorithm: "HS256",
      expiresIn: "30d",
    }
  );
  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData?.needsPasswordChange,
  };
};
export const AuthService = { loginUser };
