"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidations = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const createAdmin = zod_1.z.object({
    password: zod_1.z.string({
        required_error: "Password required",
    }),
    admin: zod_1.z.object({
        name: zod_1.z.string({
            required_error: "name required",
        }),
        email: zod_1.z.string({
            required_error: "email required",
        }),
        contactNumber: zod_1.z.string({
            required_error: "contactNumber required",
        }),
    }),
});
const createDoctor = zod_1.z.object({
    password: zod_1.z.string({
        required_error: "Password required",
    }),
    doctor: zod_1.z.object({
        name: zod_1.z.string({
            required_error: "name required",
        }),
        email: zod_1.z.string({
            required_error: "email required",
        }),
        contactNumber: zod_1.z.string({
            required_error: "contactNumber required",
        }),
        address: zod_1.z.string().optional(),
        registrationNumber: zod_1.z.string({
            required_error: "registrationNumber required",
        }),
        experience: zod_1.z.number().optional(),
        gender: zod_1.z.enum([client_1.Gender.MALE, client_1.Gender.FEMALE]),
        appointmentFee: zod_1.z.number({
            required_error: "appointmentFee required",
        }),
        qualification: zod_1.z.string({
            required_error: "qualification required",
        }),
        currentWorkingPlace: zod_1.z.string({
            required_error: "currentWorkingPlace required",
        }),
        designation: zod_1.z.string({
            required_error: "designation required",
        }),
    }),
});
const createPatient = zod_1.z.object({
    password: zod_1.z.string(),
    patient: zod_1.z.object({
        email: zod_1.z.string({
            required_error: "Email is required!"
        }).email(),
        name: zod_1.z.string({
            required_error: "Name is required!"
        }),
        contactNumber: zod_1.z.string({
            required_error: "Contact number is required!"
        }),
        address: zod_1.z.string({
            required_error: "Address is required"
        })
    })
});
const updateStatus = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum([client_1.UserStatus.ACTIVE, client_1.UserStatus.BLOCKED, client_1.UserStatus.DELETED])
    })
});
exports.userValidations = { createAdmin, createDoctor, createPatient, updateStatus };
