import { Document } from "mongoose";

export interface IStudent extends Document {
  // Basic Info
  studentID: string;
  studentName: string;

  // Academic Info
  className: string; // "Class 5", "Class 8"
  classRoll: string;
  sectionName?: string; // "A", "B", "C" (optional)
  groupName?: string; // "Science", "Arts", "Commerce" (for higher classes)
  session: string; // "2025-2026"
  academicYear?: string; // "2026"

  // Personal Info
  dateOfBirth: Date;
  birthRegNo: string;
  gender: "Male" | "Female";
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
  religion: string;

  // Parents Info
  fatherName: string;
  motherName: string;

  // Contact
  mobileNo: string;
  address?: string;

  // Financial
  monthlyFee?: number;
  admissionFee?: number;

  // Metadata
  image?: string;
  status: "active" | "inactive" | "passed_out";
  addedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Export the type for search response
export interface IStudentSearchResponse {
  _id?: string;
  studentId: string;
  name: string;
  roll: string;
  className: string;
  classId: string;
  section: string;
}

export interface IStudentDocument {
  _id: string;
  studentID: string;
  studentName: string;
  classRoll: string;
  className: string;
}
