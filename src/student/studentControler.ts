import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import studentModel from "./studentModel";
import { Student } from "./studentType";
const getAllStudents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    //   get user data from db by email filter:
    const students = await studentModel.find();

    if (!students) {
      return next(createHttpError(401, "No students found!!!"));
    }

    // response after created new user:
    res.status(201).json({
      success: true,
      data: {
        students,
      },
    });
  } catch (err) {
    return next(
      createHttpError(
        500,
        "Internal server error during getting students data.",
      ),
    );
  }
};

const addStudent = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;
  res.json({ message: "Add stu...", name });
};

export { getAllStudents, addStudent };
