import express from "express";
import { verifyToken } from "./../middlewares/verifyToken";
import { createResult, searchStudent } from "./resultControler";

const resultRouter = express.Router();

resultRouter.get("/student-data", verifyToken, searchStudent);
resultRouter.post("/create", verifyToken, createResult);
export default resultRouter;
