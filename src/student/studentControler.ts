import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import studentModel from "./studentModel";
import { Student } from "./studentType";

// Helper: Generate unique Student ID (e.g., SN-2025-0001)
const generateStudentID = async (session: string): Promise<string> => {
  const prefix = `SN-${session}-`;
  const lastStudent = await studentModel
    .findOne({ studentID: { $regex: `^${prefix}` } })
    .sort({ studentID: -1 })
    .select("studentID")
    .lean();

  let nextSeq = 1;
  if (lastStudent?.studentID) {
    const parts = lastStudent.studentID.split("-");
    const parsed = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(parsed)) nextSeq = parsed + 1;
  }

  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
};

// Add Student
const addStudent = async (req: Request, res: Response, next: NextFunction) => {
  // Ignore client-side studentID (if sent)
  const { studentID, ...studentData } = req.body;

  // 1. Basic validation
  if (
    !studentData.studentName ||
    !studentData.session ||
    !studentData.className ||
    studentData.admissionFee === undefined ||
    studentData.admissionFee === null
  ) {
    return next(createHttpError(400, "Required fields are missing!"));
  }

  try {
    // 2. Check Duplicate Roll (Class + Section + Session)
    const sectionName = studentData.sectionName?.trim() || "";
    const existingRoll = await studentModel.findOne({
      session: studentData.session,
      className: studentData.className,
      sectionName: sectionName,
      classRoll: studentData.classRoll,
    });

    if (existingRoll) {
      // Return 200 so frontend shows the info-toast instead of catch error
      return res.status(200).json({
        message: `শ্রেণি ${studentData.className}-${sectionName || "-"} এর রোল ${studentData.classRoll} ইতিমধ্যে ব্যবহৃত!`,
      });
    }

    // 3. Check Duplicate Birth Reg No
    const birthRegNo = studentData.birthRegNo?.trim() || "";
    if (birthRegNo) {
      const existingBirth = await studentModel.findOne({ birthRegNo });
      if (existingBirth) {
        return res.status(200).json({
          message: "এই জন্ম নিবন্ধন নম্বর ইতিমধ্যে নিবন্ধিত!",
        });
      }
    }

    // 4. Create Student with Collision-Safe ID Retry Loop
    let newStudent: Student | null = null;
    const MAX_RETRIES = 3;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const generatedID = await generateStudentID(studentData.session);

        newStudent = await studentModel.create({
          ...studentData,
          studentID: generatedID,
          sectionName,
          birthRegNo,
        });
        break; // Success, break out of loop
      } catch (err: any) {
        // If collision on studentID, retry
        if (
          err?.code === 11000 &&
          err?.keyPattern?.studentID &&
          attempt < MAX_RETRIES - 1
        ) {
          continue;
        }
        throw err; // Throw other errors to outer catch
      }
    }

    // 5. Response matching your frontend expectation
    res.status(201).json({
      message: "শিক্ষার্থী সফলভাবে যুক্ত হয়েছে!",
      insertedId: newStudent?._id,
      studentID: newStudent?.studentID,
    });
  } catch (err: any) {
    // Handle Mongoose duplicate key error just in case
    if (err?.code === 11000) {
      return res
        .status(200)
        .json({ message: "ডুপ্লিকেট তথ্য — ইতিমধ্যে ব্যবহৃত!" });
    }
    return next(
      createHttpError(500, "Error while creating new student in DB."),
    );
  }
};

// ==========================================
// 1. GET ALL STUDENTS WITH FILTERS & SEARCH
// ==========================================
const getAllStudents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      className,
      gender,
      session,
      religion,
      searchQuery, // This will search by studentID or classRoll
    } = req.query;

    // Base query: Only get active students (optional, remove if you want all)
    // const query: any = { isActive: true };
    const query: any = {};

    // 1. Class Name Filter (Required by your logic if others are selected)
    if (className && className !== "all") {
      query.className = className;
    }

    // 2. Gender Filter
    if (gender && gender !== "all") {
      query.gender = gender;
    }

    // 2. Gender Filter
    if (session && session !== "all") {
      query.session = session;
    }

    // 3. Religion Filter
    if (religion && religion !== "all") {
      query.religion = religion;
    }

    // 4. Search Query (Matches either studentID or classRoll)
    if (searchQuery && searchQuery !== "") {
      const searchRegex = new RegExp(searchQuery as string, "i"); // 'i' for case-insensitive
      query.$or = [
        { studentID: searchRegex },
        { classRoll: searchRegex },
        { studentName: searchRegex }, // Added name search as a bonus
      ];
    }

    // If absolutely no filters or search are provided, return empty array
    // This prevents loading 5000 students at once on initial page load
    const hasFilters =
      className || gender || session || religion || searchQuery;
    if (!hasFilters) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Execute query
    const students = await studentModel.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching students."));
  }
};

// ==========================================
// 2. GET SINGLE STUDENT BY ID/ROLL/CLASS
// ==========================================
const getSingleStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params; // Can be Mongo _id, studentID, or classRoll

    // Validate if ID is a valid Mongo ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    // Build query to find by ObjectId, studentID, or classRoll
    const query = {
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        { studentID: id },
        { classRoll: id },
      ],
    };

    const student = await studentModel.findOne(query);

    if (!student) {
      return next(createHttpError(404, "Student not found!"));
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching student details."));
  }
};

// ==========================================
// 3. DELETE STUDENT
// ==========================================
const deleteStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const deletedStudent = await studentModel.findByIdAndDelete(id);

    if (!deletedStudent) {
      return next(createHttpError(404, "Student not found!"));
    }

    res.status(200).json({
      success: true,
      message: "শিক্ষার্থীর তথ্য সফলভাবে মুছে ফেলা হয়েছে!",
      data: deletedStudent,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while deleting student."));
  }
};

export { addStudent, getAllStudents, getSingleStudent, deleteStudent };
