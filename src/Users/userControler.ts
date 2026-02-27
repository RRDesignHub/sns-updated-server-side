import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import userModel from "./userModel";
import { config } from "./../config/config";
import { User } from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;

  // check all data is exist or not:
  if (!name || !email || !password || !role) {
    const error = createHttpError(400, "All fields are required!!!");

    return next(error);
  }
  // filter the user if already exist in db:
  try {
    const user = await userModel.findOne({ email });
    if (user) {
      const error = createHttpError(
        400,
        "User already exist with this email!!!",
      );
      return next(error);
    }
  } catch (err) {
    return next(createHttpError(500, "Error while cheaking if user exist."));
  }

  // newUser var :
  let newUser: User;
  try {
    // hashing the password:
    const hashedPassword = await bcrypt.hash(password, 10);

    // create the user for saving in db:
    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while creating new user into DB."));
  }

  // jwt token generations:
  const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
    expiresIn: "1h",
  });

  // response after created new user:
  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
    },
    accessToken: token,
  });
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // check all data is exist or not:
  if (!email || !password) {
    const error = createHttpError(400, "All fields are required!!!");

    return next(error);
  }

  try {
    //   get user data from db by email filter:
    const user = await userModel.findOne({ email });

    if (!user) {
      return next(createHttpError(401, "Invalid email or password!!!"));
    }

    //   check the password is matched :
    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return next(createHttpError(401, "Password incorrect!!!"));
    }

    // jwt token generations:
    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "1h",
    });

    // response after created new user:
    res.status(201).json({
      success: true,
      message: "User logged in successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken: token,
    });
  } catch (err) {
    return next(createHttpError(500, "Internal server error during login."));
  }
};

export { createUser, loginUser };
