import express from "express";
import { addStudent, getAllStudents } from "./studentControler";

const studentRouter = express.Router();

//all students get from db:
studentRouter.get("/all-students", getAllStudents);

studentRouter.post("/add", addStudent);
// studentRouter.post("/login", loginUser);

export default studentRouter;
