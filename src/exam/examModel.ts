import mongoose, { Schema } from "mongoose";
import { IExam } from "./examTypes";

const examSchema = new Schema<IExam>(
  {
    name: {
      type: String,
      required: [true, "Exam name is required"],
      trim: true,
    },

    examType: {
      type: String,
      enum: ["semester", "yearly"],
      required: true,
    },
    section: {
      type: String,
      enum: ["primary", "secondary"],
      required: true,
    },

    academicYear: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalWorkdays: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalGuardianMeetings: {
      type: Number,
      default: 0,
      min: 0,
    },
    feeMonths: {
      type: Number,
      default: 0,
      min: 0,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

examSchema.virtual("currentStatus").get(function () {
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "completed";
});

// ✅ Include virtuals in JSON
examSchema.set("toJSON", { virtuals: true });
examSchema.set("toObject", { virtuals: true });

export const Exam = mongoose.model<IExam>("Exam", examSchema);
