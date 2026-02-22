import { config } from "../config/config";
import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";

const globalErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) =>{
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        message: err.message,
        errorStack: config.nodeEnv === "development" ? err.stack : ""
    })
    next()
}

export default globalErrorHandler;