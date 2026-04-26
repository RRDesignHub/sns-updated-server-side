import mongoose, { Schema } from "mongoose";
import { ISubjectMaster, IClassSubject } from "./subjectTypes";

// ========== SCHEMA 1: Subject Master (General Subject Catalog) ==========
const SubjectMasterSchema = new Schema<ISubjectMaster>(
  {
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    nameBn: {
      type: String,
      required: [true, "Subject Bengali name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Subject code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    totalMarks: {
      type: Number,
      required: true,
      enum: [50, 100],
    },
    academicMarks: {
      type: Number,
      required: true,
    },
    behavioralMarks: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt
  },
);

// ========== SCHEMA 2: Class Subject (Which subjects for which class) ==========
const ClassSubjectSchema = new Schema<IClassSubject>(
  {
    classId: {
      type: String,
      required: true,
      unique: true, // One document per class
    },
    className: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      enum: ["primary", "secondary", "higher"],
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    subjects: [
      {
        subjectId: {
          type: Schema.Types.ObjectId,
          ref: "SubjectMaster",
          required: true,
        },
        order: {
          type: Number,
          default: 0,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes for better performance
SubjectMasterSchema.index({ code: 1 });
SubjectMasterSchema.index({ status: 1 });
ClassSubjectSchema.index({ classId: 1, academicYear: 1 });

// Create and export models
export const SubjectMaster = mongoose.model<ISubjectMaster>(
  "SubjectMaster",
  SubjectMasterSchema,
);
export const ClassSubject = mongoose.model<IClassSubject>(
  "ClassSubject",
  ClassSubjectSchema,
);
