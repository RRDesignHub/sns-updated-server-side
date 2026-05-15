import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import {
  IPopulatedSubject,
  IStudentSearchQuery,
  IStudentSearchResponse,
} from "./resultTypes";
import { Student } from "./../student/studentModel";
import { Exam } from "./../exam/examModel";
import { Result } from "./resultModel";
import { ClassSubject } from "./../subject/subjectModel";
// ==================== SEARCH STUDENT API ====================

const searchStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { className, classRoll, academicYear, studentId } =
      req.query as IStudentSearchQuery;

    let query: any = {};
    if (className && classRoll && academicYear) {
      query = { className, classRoll: classRoll, session: academicYear };
    } else if (studentId) {
      query = { studentId };
    } else {
      const error = createHttpError(
        400,
        "ক্লাস ও রোল অথবা শিক্ষার্থী আইডি প্রদান করুন",
      );
      return next(error);
    }

    const student = (await Student.findOne(query).select(
      "_id studentID studentName classRoll className",
    )) as IStudentSearchResponse;

    if (!student) {
      const error = createHttpError(404, "শিক্ষার্থী পাওয়া যায়নি");
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: {
        _id: student._id,
        studentID: student.studentID,
        studentName: student.studentName,
        classRoll: student.classRoll,
        className: student.className,
        classId: student.classId,
        section: student.section,
      },
    });
  } catch (error: any) {
    return next(createHttpError(500, error.message));
  }
};

//==================== helping functions for creating result  ====================

// Calculate grade and GPA based on percentage (INTEGER)
const calculateGradeAndGPA = (
  percentage: number,
): { grade: string; gpa: number; isPassed: boolean } => {
  if (percentage >= 80) return { grade: "A+", gpa: 5.0, isPassed: true };
  if (percentage >= 70) return { grade: "A", gpa: 4.0, isPassed: true };
  if (percentage >= 60) return { grade: "A-", gpa: 3.5, isPassed: true };
  if (percentage >= 50) return { grade: "B", gpa: 3.0, isPassed: true };
  if (percentage >= 40) return { grade: "C", gpa: 2.0, isPassed: true };
  if (percentage >= 33) return { grade: "D", gpa: 1.0, isPassed: true };
  return { grade: "F", gpa: 0.0, isPassed: false };
};

// ✅ SIMPLIFIED: Only check total marks (33% of total)
const isSubjectPassed = (
  totalMarks: number,
  obtainedTotal: number,
): boolean => {
  const passPercent = 33;
  const requiredTotal = Math.ceil((totalMarks * passPercent) / 100);
  return obtainedTotal >= requiredTotal;
};

const createResult = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      studentId,
      examId,
      classId,
      academicYear,
      attendance,
      meetings,
      fees,
      discipline,
      subjects,
    } = req.body;

    const userId = req.user?.id || (req.user as any)?.sub;

    // ========== VALIDATION - Check required fields ==========
    if (!studentId) {
      const error = createHttpError(400, "শিক্ষার্থীর আইডি প্রদান করুন");
      return next(error);
    }

    if (!examId) {
      const error = createHttpError(400, "পরীক্ষার আইডি প্রদান করুন");
      return next(error);
    }

    if (
      !attendance ||
      typeof attendance.present !== "number" ||
      typeof attendance.total !== "number"
    ) {
      const error = createHttpError(400, "সঠিক উপস্থিতির তথ্য প্রদান করুন");
      return next(error);
    }

    if (
      !meetings ||
      typeof meetings.attended !== "number" ||
      typeof meetings.total !== "number"
    ) {
      const error = createHttpError(400, "সঠিক অভিভাবক সভার তথ্য প্রদান করুন");
      return next(error);
    }

    if (
      !fees ||
      typeof fees.paid !== "number" ||
      typeof fees.total !== "number"
    ) {
      const error = createHttpError(400, "সঠিক ফি প্রদানের তথ্য প্রদান করুন");
      return next(error);
    }

    if (!discipline || typeof discipline.obtained !== "number") {
      const error = createHttpError(400, "সঠিক শৃঙ্খলা মার্ক প্রদান করুন");
      return next(error);
    }

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      const error = createHttpError(400, "বিষয়ভিত্তিক নম্বর প্রদান করুন");
      return next(error);
    }

    // ========== VALIDATION - Check values range ==========
    if (attendance.present < 0 || attendance.present > attendance.total) {
      const error = createHttpError(400, "উপস্থিতির সংখ্যা সঠিক নয়");
      return next(error);
    }

    if (meetings.attended < 0 || meetings.attended > meetings.total) {
      const error = createHttpError(
        400,
        "অভিভাবক সভায় উপস্থিতির সংখ্যা সঠিক নয়",
      );
      return next(error);
    }

    if (fees.paid < 0 || fees.paid > fees.total) {
      const error = createHttpError(400, "ফি প্রদানের মাস সংখ্যা সঠিক নয়");
      return next(error);
    }

    if (discipline.obtained < 0 || discipline.obtained > 5) {
      const error = createHttpError(400, "শৃঙ্খলা মার্ক ০-৫ এর মধ্যে হতে হবে");
      return next(error);
    }

    // ========== FIND STUDENT ==========
    const student = await Student.findById(studentId);
    if (!student) {
      const error = createHttpError(404, "শিক্ষার্থী পাওয়া যায়নি");
      return next(error);
    }

    // ========== FIND EXAM ==========
    const exam = await Exam.findById(examId);
    if (!exam) {
      const error = createHttpError(404, "পরীক্ষা পাওয়া যায়নি");
      return next(error);
    }

    // ========== CHECK FOR DUPLICATE RESULT ==========
    const existingResult = await Result.findOne({
      studentId,
      examId,
      academicYear: academicYear || exam.academicYear,
    });

    if (existingResult) {
      const error = createHttpError(
        409,
        "এই শিক্ষার্থীর জন্য এই পরীক্ষার ফলাফল ইতিমধ্যে বিদ্যমান",
      );
      return next(error);
    }

    // ========== GET CLASS SUBJECTS ==========
    const classConfig = await ClassSubject.findOne({
      classId: classId,
      academicYear: academicYear || exam.academicYear,
    }).populate("subjects.subjectId");

    if (!classConfig) {
      const error = createHttpError(
        404,
        "এই ক্লাসের জন্য বিষয় নির্ধারণ করা হয়নি",
      );
      return next(error);
    }

    // ========== CALCULATE GLOBAL BEHAVIORAL MARKS (20 marks total) ==========
    const attendanceMark =
      attendance.total > 0
        ? Math.round((attendance.present / attendance.total) * 5)
        : 0;

    const meetingMark =
      meetings.total > 0
        ? Math.round((meetings.attended / meetings.total) * 5)
        : 0;

    const feeMark =
      fees.total > 0 ? Math.round((fees.paid / fees.total) * 5) : 0;

    const disciplineMark = Math.round(discipline.obtained);
    const totalBehavioralMarks =
      attendanceMark + meetingMark + feeMark + disciplineMark;

    // ========== CALCULATE SUBJECT RESULTS ==========
    const subjectResults = [];
    let totalObtained = 0;
    let totalMax = 0;
    let passedCount = 0;
    let failedCount = 0;
    let totalGPA = 0;

    for (const subjectData of subjects) {
      const classSubject = classConfig.subjects.find(
        (s: any) => s.subjectId._id.toString() === subjectData.subjectId,
      );

      if (!classSubject) {
        const error = createHttpError(
          404,
          `বিষয়টি পাওয়া যায়নি: ${subjectData.subjectId}`,
        );
        return next(error);
      }

      const subject = classSubject.subjectId as unknown as IPopulatedSubject;
      const customConfig = classSubject.customConfig;

      const totalSubjectMarks = customConfig?.totalMarks || subject.totalMarks;
      const academicMax = customConfig?.academicMarks || subject.academicMarks;
      const behavioralMax =
        customConfig?.behavioralMarks || subject.behavioralMarks;

      // Validate academic marks
      if (
        subjectData.obtainedAcademic < 0 ||
        subjectData.obtainedAcademic > academicMax
      ) {
        const error = createHttpError(
          400,
          `${subject.nameBn} এর একাডেমিক নম্বর সঠিক নয়`,
        );
        return next(error);
      }

      const obtainedAcademic = Math.round(subjectData.obtainedAcademic);

      // Calculate total obtained marks
      let obtainedTotal;
      let obtainedBehavioral = 0;

      if (totalSubjectMarks === 100) {
        obtainedBehavioral = totalBehavioralMarks;
        obtainedTotal = Math.round(obtainedAcademic + obtainedBehavioral);
      } else {
        obtainedTotal = Math.round(obtainedAcademic);
      }

      // Calculate percentage
      const percentage = Math.round((obtainedTotal / totalSubjectMarks) * 100);

      // ✅ Check if passed based on TOTAL marks only
      const isPassed = isSubjectPassed(totalSubjectMarks, obtainedTotal);

      let grade = "F";
      let gpa = 0.0;

      if (isPassed) {
        // ✅ Only calculate grade if passed
        const gradeInfo = calculateGradeAndGPA(percentage);
        grade = gradeInfo.grade;
        gpa = gradeInfo.gpa;
      } else {
        // ✅ Failed subject - grade F, GPA 0
        grade = "F";
        gpa = 0.0;
      }

      totalObtained += obtainedTotal;
      totalMax += totalSubjectMarks;

      if (isPassed) {
        passedCount++;
      } else {
        failedCount++;
      }
      totalGPA += gpa;

      subjectResults.push({
        subjectId: subject._id,
        name: subject.name,
        nameBn: subject.nameBn,
        code: subject.code,
        totalMarks: totalSubjectMarks,
        academicMarks: academicMax,
        behavioralMarks: behavioralMax,
        obtainedAcademic,
        obtainedBehavioral,
        obtainedTotal,
        grade,
        gpa,
        isPassed,
        customConfig: customConfig
          ? {
              originalTotalMarks: subject.totalMarks,
              originalAcademicMarks: subject.academicMarks,
              originalBehavioralMarks: subject.behavioralMarks,
            }
          : undefined,
      });
    }

    // ========== CALCULATE SUMMARY ==========
    // ✅ Check if ANY subject failed
    const hasAnyFailed = failedCount > 0;

    let finalGrade = "";
    let averageGPA = 0;
    let isOverallPassed = false;

    if (hasAnyFailed) {
      // ✅ If any subject failed, overall result is FAIL
      finalGrade = "F";
      averageGPA = 0.0;
      isOverallPassed = false;
    } else {
      // ✅ Only calculate GPA if all subjects passed
      averageGPA =
        subjectResults.length > 0 ? totalGPA / subjectResults.length : 0;

      // Determine final grade based on average GPA
      if (averageGPA >= 5.0) finalGrade = "A+";
      else if (averageGPA >= 4.0) finalGrade = "A";
      else if (averageGPA >= 3.5) finalGrade = "A-";
      else if (averageGPA >= 3.0) finalGrade = "B";
      else if (averageGPA >= 2.0) finalGrade = "C";
      else if (averageGPA >= 1.0) finalGrade = "D";
      else finalGrade = "F";

      isOverallPassed = true;
    }

    const overallPercentage =
      totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

    const summary = {
      totalSubjects: subjectResults.length,
      passedSubjects: passedCount,
      failedSubjects: failedCount,
      totalObtainedMarks: totalObtained,
      totalMaxMarks: totalMax,
      overallPercentage,
      averageGPA: Number(averageGPA.toFixed(2)),
      finalGrade,
      isPassed: isOverallPassed,
    };

    // ========== CREATE RESULT DOCUMENT ==========
    const newResult = await Result.create({
      studentId,
      examId,
      academicYear: academicYear || exam.academicYear,
      className: student.className,
      studentSnapshot: {
        studentId: student.studentID,
        studentName: student.studentName,
        classRoll: student.classRoll,
        className: student.className,
      },
      examSnapshot: {
        examId: exam._id,
        name: exam.name,
        examType: exam.examType,
      },
      behavioralData: {
        attendance: {
          present: attendance.present,
          total: attendance.total,
          marks: Number(attendanceMark.toFixed(2)),
        },
        meetings: {
          attended: meetings.attended,
          total: meetings.total,
          marks: Number(meetingMark.toFixed(2)),
        },
        fees: {
          paid: fees.paid,
          total: fees.total,
          marks: Number(feeMark.toFixed(2)),
        },
        discipline: {
          obtained: discipline.obtained,
          total: 5,
          marks: Number(disciplineMark.toFixed(2)),
        },
        totalBehavioralMarks: Number(totalBehavioralMarks.toFixed(2)),
      },
      subjectResults,
      summary,
      status: "draft",
      createdBy: userId,
    });

    // ========== SUCCESS RESPONSE ==========
    res.status(201).json({
      success: true,
      message: "ফলাফল সফলভাবে সংরক্ষণ করা হয়েছে",
      data: {
        _id: newResult?._id,
        studentName: student.studentName,
        examName: exam.name,
        totalObtained: summary.totalObtainedMarks,
        totalMax: summary.totalMaxMarks,
        grade: summary.finalGrade,
        status: newResult.status,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      const conflictError = createHttpError(
        409,
        "এই শিক্ষার্থীর জন্য এই পরীক্ষার ফলাফল ইতিমধ্যে বিদ্যমান",
      );
      return next(conflictError);
    }

    console.error("Create result error:", error);
    return next(
      createHttpError(
        500,
        "ফলাফল সংরক্ষণ করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।",
      ),
    );
  }
};

// ==================== GET FILTERED RESULTS ====================
export const getFilteredResults = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { className, academicYear, examId, status } = req.query;

    // Build filter object
    let filter: any = {};

    if (className) filter.className = className;
    if (academicYear) filter.academicYear = academicYear;
    if (examId) filter.examId = examId;
    if (status) filter.status = status;

    // If no filters, return empty
    if (Object.keys(filter).length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No filters provided",
      });
    }

    const results = await Result.find(filter);

    // ✅ ১. রোল অনুযায়ী সাজানো (ছোট থেকে বড়)
    const sortedByRoll = [...results].sort((a, b) => {
      const rollA = parseInt(a.studentSnapshot?.classRoll) || 0;
      const rollB = parseInt(b.studentSnapshot?.classRoll) || 0;
      return rollA - rollB;
    });

    // ✅ ২. GPA এবং নম্বরের ভিত্তিতে পজিশন নির্ধারণ
    // প্রথমে GPA এবং নম্বর অনুযায়ী সাজানো
    const sortedByMarks = [...results].sort((a, b) => {
      // প্রথমে GPA দেখব (উল্টো ক্রমে - বেশি থেকে কম)
      if (a.summary.averageGPA !== b.summary.averageGPA) {
        return b.summary.averageGPA - a.summary.averageGPA;
      }
      // GPA সমান হলে মোট নম্বর দেখব
      return b.summary.totalObtainedMarks - a.summary.totalObtainedMarks;
    });

    // পজিশন ম্যাপ তৈরি
    const positionMap = new Map();
    sortedByMarks.forEach((result, index) => {
      positionMap.set(result._id.toString(), index + 1);
    });

    // ✅ ফরম্যাটেড রেসপন্স তৈরি
    const formattedResults = sortedByRoll.map((result) => {
      const resultId = result._id.toString();
      const gpa = result.summary.averageGPA;
      // const totalObtained = result.summary.totalObtainedMarks;

      // GPA 0 হলে (ফেল) বিশেষ হ্যান্ডলিং
      const isFailed = gpa === 0 && !result.summary.isPassed;

      return {
        _id: result._id,
        studentName: result.studentSnapshot?.studentName,
        studentRoll: result.studentSnapshot?.classRoll,
        examName: result.examSnapshot?.name,
        totalObtained: result.summary.totalObtainedMarks,
        totalMax: result.summary.totalMaxMarks,
        percentage: result.summary.overallPercentage,
        grade: result.summary.finalGrade,
        gpa: result.summary.averageGPA,
        status: result.status,
        createdAt: result.createdAt,
        position: positionMap.get(resultId) || 0, // ✅ পজিশন যোগ করা হলো
        isFailed, // ✅ ফেল হয়েছে কিনা
      };
    });

    res.status(200).json({
      success: true,
      data: formattedResults,
      count: formattedResults.length,
    });
  } catch (error: any) {
    console.error("Get filtered results error:", error);
    return next(createHttpError(500, "ফলাফল আনতে ব্যর্থ হয়েছে"));
  }
};

// ==================== DELETE RESULT ====================
export const deleteResult = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const result = await Result.findByIdAndDelete(id);

    if (!result) {
      const error = createHttpError(404, "ফলাফল পাওয়া যায়নি");
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "ফলাফল মুছে ফেলা হয়েছে",
    });
  } catch (error: any) {
    console.error("Delete result error:", error);
    return next(createHttpError(500, "ফলাফল মুছতে ব্যর্থ হয়েছে"));
  }
};

// ==================== GET SINGLE RESULT FOR PRINT ====================
export const getResultById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const result = await Result.findById(id)
      .populate("studentId", "studentName studentID classRoll className")
      .populate("examId", "name nameBn academicYear");

    if (!result) {
      const error = createHttpError(404, "ফলাফল পাওয়া যায়নি");
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Get result by id error:", error);
    return next(createHttpError(500, "ফলাফল আনতে ব্যর্থ হয়েছে"));
  }
};
export { searchStudent, createResult };
