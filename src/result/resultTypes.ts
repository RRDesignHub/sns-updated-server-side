import { Document, Types } from "mongoose";

// ==================== RESULT TYPES ====================

// Student snapshot (minimal info frozen at result time)
export interface IStudentSnapshot {
  studentId: string;
  studentName: string;
  classRoll: string;
  className: string;
}

// Exam snapshot (minimal info frozen at result time)
export interface IExamSnapshot {
  examId: Types.ObjectId;
  name: string;
  examType: "semester" | "yearly";
}

// ========== BEHAVIORAL DATA (Global - 20 marks total) ==========

export interface IBehavioralData {
  attendance: {
    present: number;
    total: number;
    marks: number;
  };
  meetings: {
    attended: number;
    total: number;
    marks: number;
  };
  fees: {
    paid: number;
    total: number;
    marks: number;
  };
  discipline: {
    obtained: number;
    total: number;
    marks: number;
  };
  totalBehavioralMarks: number;
}

// ========== SUBJECT RESULT (Academic only, behavioral is global) ==========
export interface ISubjectResult {
  subjectId: Types.ObjectId;
  name: string;
  nameBn: string;
  code: string;
  totalMarks: number;
  academicMarks: number;
  obtainedAcademic: number;
  obtainedTotal: number;
  grade: string;
  gpa: number;
  isPassed: boolean;
  customConfig?: {
    originalTotalMarks: number;
    originalAcademicMarks: number;
    originalBehavioralMarks: number;
  };
}

// Summary of all subjects
export interface ISummary {
  totalSubjects: number;
  passedSubjects: number;
  failedSubjects: number;
  totalObtainedMarks: number;
  totalMaxMarks: number;
  overallPercentage: number;
  averageGPA: number;
  finalGrade: string;
  isPassed: boolean;
}

// ========== MAIN RESULT INTERFACE ==========
export interface IResult extends Document {
  studentId: Types.ObjectId;
  examId: Types.ObjectId;
  academicYear: string;
  className: string;
  studentSnapshot: IStudentSnapshot;
  examSnapshot: IExamSnapshot;
  behavioralData: IBehavioralData;
  subjectResults: ISubjectResult[];
  summary: ISummary;
  status: "draft" | "published";
  publishedAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ========== CREATE RESULT REQUEST BODY (Client to Server) ==========
export interface ICreateResultRequest {
  studentId: string;
  examId: string;
  className: string;
  academicYear: string;
  attendance: {
    present: number;
    total: number;
  };
  meetings: {
    attended: number;
    total: number;
  };
  fees: {
    paid: number;
    total: number;
  };
  discipline: {
    obtained: number;
    total: number;
  };
  subjects: {
    subjectId: string;
    obtainedAcademic: number;
  }[];
}

// ==================== REQUEST/RESPONSE TYPES ====================

// Search student query params
export interface IStudentSearchQuery {
  className?: string;
  classRoll?: number;
  academicYear?: string;
  studentId?: string;
}

// Search student response
export interface IStudentSearchResponse {
  _id: string;
  studentID: string;
  studentName: string;
  classRoll: number;
  className: string;
  classId?: string;
  section?: string;
  group?: string;
}

// For populated subject from ClassSubject
export interface IPopulatedSubject {
  _id: Types.ObjectId;
  name: string;
  nameBn: string;
  code: string;
  totalMarks: number;
  academicMarks: number;
  behavioralMarks: number;
  status: string;
}

// Check existing result query
export interface ICheckResultQuery {
  studentId: string;
  examId: string;
}
