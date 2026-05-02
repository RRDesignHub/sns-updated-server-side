import { Document, Types } from "mongoose";

export interface IExam extends Document {
  name: string;
  examType: "semester" | "yearly";
  section: "primary" | "secondary";
  academicYear: string;
  startDate: Date;
  endDate: Date;
  totalWorkdays: number;
  totalGuardianMeetings: number;
  feeMonths: number;
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
