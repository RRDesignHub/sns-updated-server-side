import express from "express";
import { searchStudent } from "./studentControler";
import { verifyToken } from "src/middlewares/verifyToken";

const studentRouter = express.Router();
studentRouter.get("/search", verifyToken, searchStudent);

export default studentRouter;
