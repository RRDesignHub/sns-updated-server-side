import mongoose, { Schema } from "mongoose";
import { IResult } from "./resultTypes";

const resultSchema = new Schema<IResult>(
  {
    // References
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },

    academicYear: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },

    // Snapshots (frozen at creation time)
    studentSnapshot: {
      studentId: { type: String, required: true },
      studentName: { type: String, required: true },
      classRoll: { type: String, required: true },
      className: { type: String, required: true },
    },

    examSnapshot: {
      examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
      name: { type: String, required: true },
      examType: { type: String, enum: ["semester", "yearly"], required: true },
    },

    // ✅ Global Behavioral Data (20 marks total)
    behavioralData: {
      attendance: {
        present: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
        marks: { type: Number, required: true, min: 0, max: 5 },
      },
      meetings: {
        attended: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
        marks: { type: Number, required: true, min: 0, max: 5 },
      },
      fees: {
        paid: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
        marks: { type: Number, required: true, min: 0, max: 5 },
      },
      discipline: {
        obtained: { type: Number, required: true, min: 0, max: 5 },
        total: { type: Number, required: true, default: 5 },
        marks: { type: Number, required: true, min: 0, max: 5 },
      },
      totalBehavioralMarks: { type: Number, required: true, min: 0, max: 20 },
    },

    // ✅ Subject Results (ONLY academic marks per subject)
    subjectResults: [
      {
        subjectId: {
          type: Schema.Types.ObjectId,
          ref: "SubjectMaster",
          required: true,
        },
        name: { type: String, required: true },
        nameBn: { type: String, required: true },
        code: { type: String, required: true },
        totalMarks: { type: Number, required: true },
        academicMarks: { type: Number, required: true },
        obtainedAcademic: { type: Number, required: true, min: 0 },
        obtainedTotal: { type: Number, required: true, min: 0 },
        grade: { type: String, required: true },
        gpa: { type: Number, required: true, min: 0, max: 5 },
        isPassed: { type: Boolean, required: true },
        customConfig: {
          originalTotalMarks: Number,
          originalAcademicMarks: Number,
          originalBehavioralMarks: Number,
        },
      },
    ],

    // Summary
    summary: {
      totalSubjects: { type: Number, required: true },
      passedSubjects: { type: Number, required: true },
      failedSubjects: { type: Number, required: true },
      totalObtainedMarks: { type: Number, required: true },
      totalMaxMarks: { type: Number, required: true },
      overallPercentage: { type: Number, required: true },
      averageGPA: { type: Number, required: true, min: 0, max: 5 },
      finalGrade: { type: String, required: true },
      isPassed: { type: Boolean, required: true },
    },

    // Metadata
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    publishedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  },
);

// Compound unique index to prevent duplicate results
resultSchema.index({ studentId: 1, examId: 1 }, { unique: true });
resultSchema.index({ classId: 1, academicYear: 1 });
resultSchema.index({ examId: 1, className: 1 });
export const Result = mongoose.model<IResult>("Result", resultSchema);
