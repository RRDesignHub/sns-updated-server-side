import express from "express";
import { addStudent } from "./studentControler";

const studentRouter = express.Router();

//all students get from db:
studentRouter.get("/all-students", (req, res) =>{
	res.json({message: "All students get..."})
});

studentRouter.post("/add", addStudent);
// studentRouter.post("/login", loginUser);

export default studentRouter;
