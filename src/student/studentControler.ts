import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { sign } from "jsonwebtoken";
import { config } from "./../config/config";

const addStudent = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;
  res.json({ message: "Add stu...", name });
};

export { addStudent };
