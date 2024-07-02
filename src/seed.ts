import { error } from "console";
import prisma from "./app/utils/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from 'bcrypt'
const seedSuperAdmin = async () => {
  try {
    const isExistSuperAdmin = await prisma.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
    });

    if (isExistSuperAdmin) {
        console.log("Super Admin Already Exists")
      return;
    }

    const hashedPassword = await bcrypt.hash("123456", 10);

    const superAdminData = await prisma.user.create({
      data: {
        email: "superadmin@gmail.com",
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        admin: {
          create: {
            name: "superadmin",
            // email : "superadmin@gmail.com",
            contactNumber: "123456789",
          },
        },
      },
    });
    console.log(superAdminData);
  } catch (err) {
    console.log(err);
  }finally{
    await prisma.$disconnect()
  }
};
seedSuperAdmin()
