import express from "express";
import { allUsers, createUser, deleteUser, loginUser } from "./userControler";
import { verifyToken } from "./../middlewares/verifyToken";

const userRouter = express.Router();

userRouter.get("/", verifyToken, allUsers);
userRouter.post("/register", verifyToken, createUser);
userRouter.post("/login", loginUser);
userRouter.delete("/:id", verifyToken, deleteUser);
export default userRouter;
