import express from "express";
import { addStudent } from "./studentControler";

const studentRouter = express.Router();

studentRouter.post("/add", addStudent);
// studentRouter.post("/login", loginUser);

export default studentRouter;
