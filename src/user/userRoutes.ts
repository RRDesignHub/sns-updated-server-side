import express from "express";
import { allUsers, createUser, loginUser } from "./userControler";

const userRouter = express.Router();

userRouter.get("/", allUsers);
userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);

export default userRouter;
