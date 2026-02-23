import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

const createUser = async(req: Request, res: Response, next: NextFunction) =>{

    const {name, email, password, role} = req.body;

    if(!name || !email || !password || !role){
        const error = createHttpError(400, "All fields are required!!!");

        return next(error);
    }

    res.json({message: "Created"})

}


export {createUser};