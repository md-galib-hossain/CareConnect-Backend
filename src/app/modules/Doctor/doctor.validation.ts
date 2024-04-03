import { z } from 'zod';

const createDoctor = z.object({
    body: z.object({
        email: z.string({
            required_error: 'Email is required',
        }),
        name: z.string({
            required_error: 'Name is required',
        }),
        profilePhoto: z.string({
            required_error: 'Profile Photo is required',
        }),
        contactNumber: z.string({
            required_error: 'Contact Number is required',
        }),
        registrationNumber: z.string({
            required_error: 'Registration Number is required',
        }),
        experience: z.number({
            required_error: 'Experience is required',
        }),
        gender: z.string({
            required_error: 'Gender is required',
        }),
        apointmentFee: z.number({
            required_error: 'Blood group is required',
        }),
        qualification: z.string({
            required_error: 'Apointment Fee is required',
        }),
        currentWorkingPlace: z.string({
            required_error: 'Current Working Place is required',
        }),
        designation: z.string({
            required_error: 'Designation is required',
        }),
    }),
});
export const DoctorValidation = {
    createDoctor,
};