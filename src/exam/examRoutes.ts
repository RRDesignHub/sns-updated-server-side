import express from "express";

import { verifyToken } from "./../middlewares/verifyToken";
import { createExam, deleteExam, getAllExams } from "./examControler";

const examRouter = express.Router();
// Exam routes
examRouter.post("/create", verifyToken, createExam);
examRouter.get("/all", verifyToken, getAllExams);
// examRouter.get("/:id", getExamById);
// examRouter.put("/update/:id", updateExam);
examRouter.delete("/delete/:id", verifyToken, deleteExam);

export default examRouter;
