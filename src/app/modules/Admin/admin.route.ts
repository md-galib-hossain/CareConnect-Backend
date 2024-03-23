import express, { NextFunction, Request, Response } from "express";
import { AdminControllers } from "./admin.controller";
import { AnyZodObject, z } from "zod";
const router = express.Router();

const update = z.object({
  body: z.object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
  }),
});
const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
      });
      return next();
    } catch (err) {
      next(err);
    }
  };
};

router.get("/", AdminControllers.getAdmins);
router.get("/:id", AdminControllers.getSingleAdmin);
router.patch(
  "/:id",
  validateRequest(update),
  AdminControllers.updateSingleAdmin
);
router.delete("/:id", AdminControllers.deleteSingleAdmin);

export const AdminRoutes = router;
