import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
// verify user token middleware:
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorised Access!!!" });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, config.jwtSecret as string, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: "Unauthorised Access!!!" });
    }
    // req.decoded = decoded;
  });
  next();
};

module.exports = verifyToken;
