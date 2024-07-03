"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewValidation = void 0;
const zod_1 = require("zod");
const createReview = zod_1.z.object({
    body: zod_1.z.object({
        appointmentId: zod_1.z.string({
            required_error: 'Appointment Id is required',
        }),
        rating: zod_1.z.number({
            required_error: 'Rating is required',
        }),
        comment: zod_1.z.string().optional()
    }),
});
exports.ReviewValidation = {
    createReview,
};
