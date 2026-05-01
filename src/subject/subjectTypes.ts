import { Document, Types } from "mongoose";

// ========== SUBJECT MASTER TYPE (General Subjects) ==========
export interface ISubjectMaster extends Document {
  name: string; // English name: "Bangla 1st Paper"
  nameBn: string; // Bengali name: "বাংলা ১ম পত্র"
  code: string; // Unique code: "BAN-101"
  totalMarks: 50 | 100; // 50 or 100
  academicMarks: number; // 80 (if 100) or 50 (if 50)
  behavioralMarks: number; // 20 (if 100) or 0 (if 50)
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

// ========== CLASS SUBJECT TYPE (Class-specific Configuration) ==========
export interface IAssignedSubject {
  subjectId: Types.ObjectId; // Reference to SubjectMaster
  order: number; // Display order in class
  isActive: boolean; // Whether subject is active for this class
  // ✅ Add customConfig if your server supports it
  customConfig?: {
    totalMarks?: number;
    academicMarks?: number;
    behavioralMarks?: number;
  };
}

export interface IClassSubject extends Document {
  classId: string; // "class-5"
  className: string; // "পঞ্চম শ্রেণি"
  section: "primary" | "secondary"; // ✅ Add "higher" if needed
  academicYear: string; // "2026"
  subjects: IAssignedSubject[];
  group?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
