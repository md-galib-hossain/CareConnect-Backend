import { z } from "zod";

const createAdmin = z.object({
  password: z.string({
    required_error: "Password required",
  }),
  admin: z.object({
    name: z.string({
      required_error: "name required",
    }),
    email: z.string({
      required_error: "email required",
    }),
    contactNumber: z.string({
      required_error: "contactNumber required",
    }),
  }),
});

export const userValidations = {createAdmin}