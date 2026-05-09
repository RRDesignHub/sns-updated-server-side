import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { Student } from "./studentModel";
import { IStudentSearchResponse } from "./studentType";

export const searchStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { className, roll, studentId } = req.query;

    let query: any = {};

    if (className && roll) {
      query = { className, classRoll: roll };
    } else if (studentId) {
      query = { studentID: studentId };
    } else {
      const error = createHttpError(
        400,
        "ক্লাস ও রোল অথবা শিক্ষার্থী আইডি প্রদান করুন",
      );
      return next(error);
    }

    // ✅ Student is now imported correctly
    const student = await Student.findOne(query).select(
      "_id studentID studentName classRoll className",
    );

    if (!student) {
      const error = createHttpError(404, "শিক্ষার্থী পাওয়া যায়নি");
      return next(error);
    }

    const response: IStudentSearchResponse = {
      _id: Object(student?._id),
      studentId: student.studentID,
      name: student.studentName,
      roll: student.classRoll,
      className: student.className,
      classId: `class-${student.className.toLowerCase().replace(" ", "-")}`,
      section: "primary",
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return next(createHttpError(500, error.message));
  }
};
