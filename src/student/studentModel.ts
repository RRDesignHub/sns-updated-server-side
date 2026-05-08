import mongoose, { Schema } from "mongoose";
import { IStudent } from "./studentType";

const studentSchema = new Schema<IStudent>(
  {
    // ========== Basic Info ==========
    studentID: {
      type: String,
      required: [true, "Student ID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },

    // ========== Academic Info ==========
    className: {
      type: String, // ✅ Keep as String (matches "4", "Play", "Class 5")
      required: [true, "Class name is required"],
      trim: true,
      index: true,
    },
    classRoll: {
      type: String, // ✅ CHANGE: Database has "100" as string, not number
      required: [true, "Class roll is required"],
      index: true,
    },
    sectionName: {
      type: String,
      trim: true,
      default: "",
    },
    groupName: {
      type: String,
      trim: true,
      default: "",
    },
    session: {
      type: String,
      required: [true, "Session is required"],
      trim: true,
    },
    academicYear: {
      type: String,
      trim: true,
    },

    // ========== Personal Info ==========
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    birthRegNo: {
      type: String,
      required: [true, "Birth registration number is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: [true, "Gender is required"],
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      required: false,
    },
    religion: {
      type: String,
      required: [true, "Religion is required"],
      trim: true,
    },

    // ========== Parents Info ==========
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true,
    },
    motherName: {
      type: String,
      required: [true, "Mother's name is required"],
      trim: true,
    },

    // ========== Contact Info ==========
    mobileNo: {
      type: String, // ✅ Keep as String (matches "1814923963")
      required: [true, "Mobile number is required"],
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    // ========== Financial Info ==========
    monthlyFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    admissionFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ========== Metadata ==========
    image: {
      type: String,
      default: "https://i.ibb.co/V0jk4tCT/images.png",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "passed_out"],
      default: "active",
      index: true,
    },
    addedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// ========== COMPOUND INDEXES ==========
studentSchema.index({ className: 1, classRoll: 1 }, { unique: true });
studentSchema.index({ className: 1, classRoll: 1, session: 1 });
studentSchema.index({ status: 1, className: 1 });
studentSchema.index({ studentID: 1 });

// ========== VIRTUAL PROPERTIES ==========
studentSchema.virtual("classId").get(function () {
  const classMap: Record<string, string> = {
    Play: "class-play",
    Nursery: "class-nursery",
    "1": "class-1",
    "2": "class-2",
    "3": "class-3",
    "4": "class-4",
    "5": "class-5",
    "6": "class-6",
    "7": "class-7",
    "8": "class-8",
    "9": "class-9",
    "10": "class-10",
    "Class 1": "class-1",
    "Class 2": "class-2",
    "Class 3": "class-3",
    "Class 4": "class-4",
    "Class 5": "class-5",
  };
  return classMap[this.className] || null;
});

studentSchema.virtual("section").get(function () {
  const primaryClasses = [
    "Play",
    "Nursery",
    "1",
    "2",
    "3",
    "4",
    "5",
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
  ];
  return primaryClasses.includes(this.className) ? "primary" : "secondary";
});

studentSchema.set("toJSON", { virtuals: true });
studentSchema.set("toObject", { virtuals: true });

export const Student = mongoose.model<IStudent>(
  "Student",
  studentSchema,
  "students",
);
