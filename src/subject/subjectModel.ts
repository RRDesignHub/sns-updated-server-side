import mongoose, { Schema } from "mongoose";
import { ISubjectMaster, IClassSubject } from "./subjectTypes";

// ========== SCHEMA 1: Subject Master (What subjects exist) ==========
const SubjectMasterSchema = new Schema<ISubjectMaster>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    totalMarks: { type: Number, enum: [50, 100], required: true },
    academicMarks: { type: Number, required: true },
    behavioralMarks: { type: Number, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

// ========== SCHEMA 2: Class Subject Config (Which subjects for which class) ==========
const ClassSubjectSchema = new Schema<IClassSubject>(
  {
    classId: { type: String, required: true, unique: true },
    className: { type: String, required: true },
    section: {
      type: String,
      enum: ["primary", "secondary"],
      required: true,
    },
    academicYear: { type: String, required: true },
    subjects: [
      {
        subjectId: {
          type: Schema.Types.ObjectId,
          ref: "SubjectMaster",
          required: true,
        },
        order: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

export const SubjectMaster = mongoose.model(
  "SubjectMaster",
  SubjectMasterSchema,
);
export const ClassSubject = mongoose.model("ClassSubject", ClassSubjectSchema);
