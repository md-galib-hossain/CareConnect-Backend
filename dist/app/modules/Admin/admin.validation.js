"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminValidations = void 0;
const zod_1 = require("zod");
const updateAdmin = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        contactNumber: zod_1.z.string().optional(),
    }),
});
exports.AdminValidations = { updateAdmin };
