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

      // Validate
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

      // Only add behavioral marks for 100-mark subjects
      let obtainedTotal;
      if (totalSubjectMarks === 100) {
        obtainedTotal = Math.round(
          subjectData.obtainedAcademic + totalBehavioralMarks,
        );
      } else {
        obtainedTotal = Math.round(subjectData.obtainedAcademic);
      }

      const percentage = Number(
        ((obtainedTotal / totalSubjectMarks) * 100).toFixed(2),
      );

      // Calculate grade
      let grade = "";
      let gpa = 0;
      let isPassed = true;

      if (percentage >= 80) {
        grade = "A+";
        gpa = 5.0;
      } else if (percentage >= 70) {
        grade = "A";
        gpa = 4.0;
      } else if (percentage >= 60) {
        grade = "A-";
        gpa = 3.5;
      } else if (percentage >= 50) {
        grade = "B";
        gpa = 3.0;
      } else if (percentage >= 40) {
        grade = "C";
        gpa = 2.0;
      } else if (percentage >= 33) {
        grade = "D";
        gpa = 1.0;
      } else {
        grade = "F";
        gpa = 0.0;
        isPassed = false;
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
        obtainedAcademic: subjectData.obtainedAcademic,
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
    const overallPercentage =
      totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    const averageGPA =
      subjectResults.length > 0
        ? Number((totalGPA / subjectResults.length).toFixed(2))
        : 0;

    let finalGrade = "";
    if (overallPercentage >= 80) finalGrade = "A+";
    else if (overallPercentage >= 70) finalGrade = "A";
    else if (overallPercentage >= 60) finalGrade = "A-";
    else if (overallPercentage >= 50) finalGrade = "B";
    else if (overallPercentage >= 40) finalGrade = "C";
    else if (overallPercentage >= 33) finalGrade = "D";
    else finalGrade = "F";

    const isOverallPassed = finalGrade !== "F";

    const summary = {
      totalSubjects: subjectResults.length,
      passedSubjects: passedCount,
      failedSubjects: failedCount,
      totalObtainedMarks: Number(totalObtained.toFixed(2)),
      totalMaxMarks: totalMax,
      overallPercentage: Number(overallPercentage.toFixed(2)),
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

    // ✅ Important: className must match exactly what's in DB
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

    const results = await Result.find(filter).sort({ createdAt: -1 });

    console.log("Found results:", results.length); // Debug log

    // Format response for client
    const formattedResults = results.map((result) => ({
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
    }));

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
