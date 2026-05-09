import express from "express";
import {
  createResult,
  deleteResult,
  getFilteredResults,
  getResultById,
  searchStudent,
} from "./resultControler";
import { verifyToken } from "./../middlewares/verifyToken";

const resultRouter = express.Router();

resultRouter.get("/student-data", verifyToken, searchStudent);
resultRouter.post("/create", verifyToken, createResult);

// Get filtered results (for class-based results page)
resultRouter.get("/filter", verifyToken, getFilteredResults);

// Get single result by ID (for print preview)
resultRouter.get("/:id", verifyToken, getResultById);

// Delete result
resultRouter.delete("/:id", verifyToken, deleteResult);
export default resultRouter;
