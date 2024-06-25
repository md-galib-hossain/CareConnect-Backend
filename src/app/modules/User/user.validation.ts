import { Gender, UserStatus } from "@prisma/client";
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

const createDoctor = z.object({
  password: z.string({
    required_error: "Password required",
  }),
  doctor: z.object({
    name: z.string({
      required_error: "name required",
    }),
    email: z.string({
      required_error: "email required",
    }),
    contactNumber: z.string({
      required_error: "contactNumber required",
    }),
    address: z.string().optional(),
    registrationNumber : z.string({
      required_error: "registrationNumber required",
    }),
    experience : z.number().optional(),
    gender :z.enum([Gender.MALE,Gender.FEMALE]),
    appointmentFee: z.number({
      required_error: "appointmentFee required",
    }),
    qualification : z.string({
      required_error: "qualification required",
    }),
    currentWorkingPlace:  z.string({
      required_error: "currentWorkingPlace required",
    }),
    designation:  z.string({
      required_error: "designation required",
    }),
   
  }),
})
const createPatient = z.object({
  password: z.string(),
  patient: z.object({
      email: z.string({
          required_error: "Email is required!"
      }).email(),
      name: z.string({
          required_error: "Name is required!"
      }),
      contactNumber: z.string({
          required_error: "Contact number is required!"
      }),
      address: z.string({
          required_error: "Address is required"
      })
  })
});
const updateStatus = z.object({
  body: z.object({
      status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED])
  })
})

export const userValidations = {createAdmin,createDoctor,createPatient,updateStatus}