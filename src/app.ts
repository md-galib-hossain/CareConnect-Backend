import express, { Application, Request, Response } from "express";
import cors from "cors";
import { AdminRoutes } from "./app/modules/Admin/admin.route";
import { UserRoutes } from "./app/modules/User/user.route";

const app: Application = express();

app.use(cors());
//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Hello",
  });
});
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/admin", AdminRoutes);

export default app;
