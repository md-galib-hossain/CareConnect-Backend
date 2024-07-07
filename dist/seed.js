"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("./app/utils/prisma"));
const seedSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isExistSuperAdmin = yield prisma_1.default.user.findFirst({
            where: {
                role: client_1.UserRole.SUPER_ADMIN,
            },
        });
        if (isExistSuperAdmin) {
            console.log("Super Admin Already Exists");
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash("123456", 10);
        const superAdminData = yield prisma_1.default.user.create({
            data: {
                email: "superadmin@gmail.com",
                password: hashedPassword,
                role: client_1.UserRole.SUPER_ADMIN,
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
    }
    catch (err) {
        console.log(err);
    }
    finally {
        yield prisma_1.default.$disconnect();
    }
});
seedSuperAdmin();
