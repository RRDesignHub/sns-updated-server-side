import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import userModel from "./userModel";

const createUser = async(req: Request, res: Response, next: NextFunction) =>{

    const {name, email, password, role} = req.body;

    // check all data is exist or not:
    if(!name || !email || !password || !role){
        const error = createHttpError(400, "All fields are required!!!");

        return next(error);
    }

    // filter the user if already exist in db:
    const user = await userModel.findOne({email})
    if(user) {
        const error = createHttpError(400, "User already exist with this email!!!")
        return next(error);
    }

    // hashing the password:
    const hashedPassword = await bcrypt.hash(password, 10);
    

    // create the user for saving in db:
    const newUser = userModel.create({
        name, 
        email,
        password: hashedPassword,
        role
    })

    res.json(newUser)

}


export {createUser};