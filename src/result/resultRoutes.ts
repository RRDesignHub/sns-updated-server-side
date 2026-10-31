import express from "express";
import {
  createResult,
  deleteResult,
  getAggregateResultsByClass,
  getFilteredResults,
  getResultById,
  searchStudent,
  publicSearchResult,
} from "./resultControler";
import { verifyToken } from "./../middlewares/verifyToken";

const resultRouter = express.Router();

// ========== PUBLIC ROUTES (NO AUTH) ==========
resultRouter.get("/public-search", publicSearchResult);

// ========== STATIC ROUTES (must come first) ==========
resultRouter.get("/student-data", verifyToken, searchStudent);
resultRouter.post("/create", verifyToken, createResult);
resultRouter.get("/filter", verifyToken, getFilteredResults);
resultRouter.get("/aggregate/class", verifyToken, getAggregateResultsByClass);

// ========== DYNAMIC ROUTES (must come last) ==========
resultRouter.get("/:id", verifyToken, getResultById);
resultRouter.delete("/:id", verifyToken, deleteResult);

export default resultRouter;
