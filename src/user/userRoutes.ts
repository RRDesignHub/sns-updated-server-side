import express from "express";
import { allUsers, createUser, loginUser } from "./userControler";
import { verifyToken } from "./../middlewares/verifyToken";

const userRouter = express.Router();

userRouter.get("/", verifyToken, allUsers);
userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);

export default userRouter;
