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

// Behavioral marks data
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
  totalBehavioralMarks: number;
}

// Individual subject result (compact format)
export interface ISubjectResult {
  subjectId: Types.ObjectId;
  name: string;
  nameBn: string;
  code: string;
  totalMarks: number;
  academicMarks: number;
  behavioralMarks: number;
  obtainedAcademic: number;
  obtainedBehavioral: number;
  obtainedDiscipline: number;
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

// Main Result Interface
export interface IResult extends Document {
  studentId: Types.ObjectId;
  examId: Types.ObjectId;
  academicYear: string;
  classId: string;
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

// Create result request body
export interface ICreateResultRequest {
  studentId: string;
  examId: string;
  academicYear: string;
  classId: string;
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
  subjects: {
    subjectId: string;
    obtainedAcademic: number;
    obtainedBehavioral: number;
    obtainedDiscipline: number;
  }[];
}

// Check existing result query
export interface ICheckResultQuery {
  studentId: string;
  examId: string;
}
