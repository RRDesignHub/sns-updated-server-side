import express from "express";
import {
  createSubject,
  deleteSubject,
  getAllSubjects,
  updateSubject,
  getAllClassSubjects,
  getClassSubjectsByClassId,
  assignSubjectsToClass,
  updateClassSubjects,
  deleteClassSubjects,
  getAvailableSubjectsForClass,
  updateSubjectOrder,
  toggleSubjectStatus,
} from "./subjectControler";
import { verifyToken } from "./../middlewares/verifyToken";

const subjectRouter = express.Router();

//all subjects get from db:
subjectRouter.get("/all-subjects", verifyToken, getAllSubjects);

subjectRouter.post("/create", verifyToken, createSubject);
subjectRouter.put("/update/:id", verifyToken, updateSubject);

subjectRouter.delete("/:id", verifyToken, deleteSubject);

// ==================== CLASS SUBJECT ROUTES ====================
// Get all class configurations
subjectRouter.get("/classes/all", verifyToken, getAllClassSubjects);

// Get subjects for a specific class
subjectRouter.get(
  "/classes/:classId/subjects",
  verifyToken,
  getClassSubjectsByClassId,
);

// Get available subjects for a class (not yet assigned)
subjectRouter.get(
  "/classes/:classId/available",
  verifyToken,
  getAvailableSubjectsForClass,
);

// Assign subjects to a class
subjectRouter.post("/classes/assign", verifyToken, assignSubjectsToClass);

// Update entire class configuration
subjectRouter.put("/classes/:id", verifyToken, updateClassSubjects);

// Delete class configuration
subjectRouter.delete("/classes/:id", verifyToken, deleteClassSubjects);

// Update subject order within a class
subjectRouter.put("/classes/:id/order", verifyToken, updateSubjectOrder);

// Toggle subject active status
subjectRouter.patch(
  "/classes/:classId/subjects/:subjectId/toggle",
  verifyToken,
  toggleSubjectStatus,
);

export default subjectRouter;
