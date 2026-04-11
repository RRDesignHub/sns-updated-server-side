import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import globalErrorHandler from "./middlewares/globalErrorHandaler";
import userRouter from "./user/userRoutes";
import studentRouter from "./student/studentRoutes";

const app = express();
// Body parser middleware
app.use(morgan("dev"));
app.use(
  cors({
    origin: "https://sn-school-dashboard.netlify.app",
  }),
);
app.use(express.json());

// root get api
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "SNS Server is running...",
  });
});

// API Routes
app.use("/api/users", userRouter);
app.use("/api/students", studentRouter);

// Global error handler (should be last)
app.use(globalErrorHandler);

export default app;
