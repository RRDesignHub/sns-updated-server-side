import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { Exam } from "./examModel";
import { IExam } from "./examTypes";

// ==================== CREATE EXAM ====================
export const createExam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    name,
    examType,
    section,
    academicYear,
    startDate,
    endDate,
    totalWorkdays,
    totalGuardianMeetings,
    feeMonths,
  } = req.body;

  // Check all required fields
  if (
    !name ||
    !examType ||
    !section ||
    !academicYear ||
    !startDate ||
    !endDate
  ) {
    const error = createHttpError(400, "All required fields must be provided");
    return next(error);
  }

  // Validate dates
  if (new Date(startDate) > new Date(endDate)) {
    const error = createHttpError(400, "Start date cannot be after end date");
    return next(error);
  }

  // Check if exam already exists for this class and session
  try {
    const existingExam = await Exam.findOne({
      name,
      section,
      academicYear,
      examType,
    });

    if (existingExam) {
      const error = createHttpError(
        400,
        `Exam already exists for ${section} in ${academicYear}`,
      );
      return next(error);
    }
  } catch (err: any) {
    return next(createHttpError(500, "Error while checking existing exam"));
  }

  // Create new exam
  let newExam: IExam;
  try {
    newExam = await Exam.create({
      name,
      examType,
      section,
      academicYear,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalWorkdays: totalWorkdays || 0,
      totalGuardianMeetings: totalGuardianMeetings || 0,
      feeMonths: feeMonths || 0,
      createdBy: (req as any).user?.email,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while creating exam in database"));
  }

  // Response after created exam
  res.status(201).json({
    success: true,
    message: "Exam created successfully",
    data: {
      id: newExam._id,
      name: newExam.name,
      examType: newExam.examType,
      academicYear: newExam.academicYear,
      startDate: newExam.startDate,
      endDate: newExam.endDate,
    },
  });
};

// ==================== GET ALL EXAMS ====================
export const getAllExams = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status, section, academicYear } = req.query;

    // Build filter object
    let filter: any = {};

    if (status) filter.status = status;
    if (section) filter.section = section;
    if (academicYear) filter.academicYear = academicYear;

    const exams = await Exam.find(filter)
      .sort({ startDate: -1 })
      .select("-__v");

    if (!exams || exams.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No exams found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: `${exams.length} exams found`,
      data: exams,
    });
  } catch (err) {
    return next(
      createHttpError(500, "Error while fetching exams from database"),
    );
  }
};

// Delete exam
export const deleteExam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findByIdAndDelete(id);

    if (!exam) {
      const error = createHttpError(404, "Exam not found");
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (err) {
    return next(createHttpError(500, "Error while deleting exam"));
  }
};
