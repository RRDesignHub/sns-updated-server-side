import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import userModel from "./userModel";
import { config } from "./../config/config";

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
    const newUser = await userModel.create({
        name, 
        email,
        password: hashedPassword,
        role
    })

    // jwt token generations:
    const token = sign({sub: newUser._id}, config.jwtSecret as string, {expiresIn: "1h"});

    // response after created new user:
    res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role
            },
            accessToken: token
        });

}


export {createUser};