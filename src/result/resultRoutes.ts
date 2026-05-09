import express from "express";
import { createResult, searchStudent } from "./resultControler";
import { verifyToken } from "./../middlewares/verifyToken";

const resultRouter = express.Router();

resultRouter.get("/student-data", verifyToken, searchStudent);
resultRouter.post("/create", verifyToken, createResult);
export default resultRouter;
