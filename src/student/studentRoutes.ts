import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
  addStudent,
  getAllStudents,
  getSingleStudent,
  deleteStudent,
} from "./studentControler";

const studentRouter = express.Router();

// POST: /api/students/add-student
studentRouter.post("/add-student", verifyToken, addStudent);

// GET: /api/students (List with filters: ?className=1&gender=Male&searchQuery=SN-2026)
studentRouter.get("/", verifyToken, getAllStudents);

// GET: /api/students/details/:id (Get by Mongo ID, studentID, or classRoll)
studentRouter.get("/details/:id", verifyToken, getSingleStudent);

// GET: /api/students/:studentID (Your existing endpoint)
studentRouter.get("/:studentID", verifyToken, getSingleStudent);

// DELETE: /api/students/:id
studentRouter.delete("/:id", verifyToken, deleteStudent);

export default studentRouter;
