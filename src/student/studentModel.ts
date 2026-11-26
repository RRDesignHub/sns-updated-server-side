import mongoose from "mongoose";
import { Student } from "./studentType";

const studentSchema = new mongoose.Schema<Student>(
  {
    studentID: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    section: {
      type: String,
      enum: ["primary", "higher"],
      required: true,
    },
    className: { type: String, required: true },
    classRoll: { type: String, required: true },
    groupName: { type: String, default: "" },
    sectionName: { type: String, default: "" },
    session: { type: String, required: true },
    studentName: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    mobileNo: { type: Number, required: true },
    birthRegNo: { type: String, default: "" },
    dateOfBirth: { type: String, required: true },
    address: { type: String, default: "" },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      default: "A+",
    },
    religion: {
      type: String,
      enum: ["Islam", "Hindu", "Christian", "Buddhist"],
      required: true,
    },
    image: {
      type: String,
      default: "https://i.ibb.co.com/V0jk4tCT/images.png",
    },
    admissionFee: {
      type: Number,
      required: true,
      min: [0, "Admission fee cannot be negative"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// 1. Prevent duplicate roll in same class/section/session
studentSchema.index(
  { session: 1, className: 1, sectionName: 1, classRoll: 1 },
  { unique: true },
);

// 2. Prevent duplicate birth registration number (only if provided)
studentSchema.index(
  { birthRegNo: 1 },
  {
    unique: true,
    partialFilterExpression: { birthRegNo: { $type: "string", $ne: "" } },
  },
);

export default mongoose.model<Student>("Student", studentSchema);
