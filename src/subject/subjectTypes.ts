import { Document, Types } from "mongoose";

// Subject Master - What subjects exist in the system
export interface ISubjectMaster extends Document {
  name: string;
  code: string;
  totalMarks: 50 | 100;
  academicMarks: number; // 80 (if 100) or 50 (if 50)
  behavioralMarks: number; // 20 (if 100) or 0 (if 50)
  status: "active" | "inactive";
}

// Class Config - Which subjects for which class
export interface IClassSubject extends Document {
  classId: string; // "class-5"
  className: string; // "Class 5"
  section: "primary" | "secondary";
  academicYear: string; // "2025"
  subjects: {
    subjectId: Types.ObjectId; // Reference to SubjectMaster
    order: number; // Display order
  }[];
}
