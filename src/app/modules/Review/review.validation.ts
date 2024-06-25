import { z } from 'zod';

const createReview = z.object({
    body: z.object({
        appointmentId: z.string({
            required_error: 'Appointment Id is required',
        }),
        rating: z.number({
            required_error: 'Rating is required',
        }),
        comment: z.string().optional()
    }),
});

export const ReviewValidation = {
    createReview,
};