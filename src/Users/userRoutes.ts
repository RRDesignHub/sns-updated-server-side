import express from "express";

const userRouter = express.Router();


userRouter.post("/register", async(req, res) =>{
    res.json({message: "User register api..."})
})


export default userRouter;