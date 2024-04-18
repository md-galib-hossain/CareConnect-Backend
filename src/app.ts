import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import { AdminRoutes } from "./app/modules/Admin/admin.route";
import { UserRoutes } from "./app/modules/User/user.route";
import router from "./app/routes";
import httpStatus from "http-status";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { AppointmentService } from "./app/modules/Appointment/appointment.service";
import cron from "node-cron";
const app: Application = express();

app.use(cors());
app.use(cookieParser());
//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//check each miniutes if any appointment is not paid in less or equal than 30 mins then deleete that appointment
cron.schedule("* * * * *", () => {
  try {
    AppointmentService.cancelUnpaidAppointments();
  } catch (err) {
    console.log(err);
  }
});
app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Hello",
  });
});
app.use("/api/v1", router);
app.use(globalErrorHandler);
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API not found!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not available",
    },
  });
});
export default app;
