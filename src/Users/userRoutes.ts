import express from "express";
import { createUser } from "./userControler";

const userRouter = express.Router();


userRouter.post("/register", createUser);


export default userRouter;