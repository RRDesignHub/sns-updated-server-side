import mongoose from "mongoose";
import { Student } from "./studentType";

const studentSchema = new mongoose.Schema<Student>(
  {
    className: {
      type: String,
      required: true,
    },
    classRoll: {
      type: Number,
      required: true,
    },
    sectionName: {
      type: String,
      required: true,
    },
    groupName: {
      type: String,
      required: true,
    },
    birthRegNo: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    session: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    fatherName: {
      type: String,
      required: true,
    },
    motherName: {
      type: String,
      required: true,
    },
    studentID: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    religion: {
      type: String,
      required: true,
    },
    mobileNo: {
      type: String,
      required: true,
    },
    admissionFee: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<Student>("Student", studentSchema);
