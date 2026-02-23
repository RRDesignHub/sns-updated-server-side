import express from "express";
import { config } from "./config/config";
import connectDB from "./config/db.config";
import globalErrorHandler from "./middlewares/globalErrorHandaler";
import userRouter from "./Users/userRoutes";



const app = express();
const port = config.port || 3000;

app.use(express.json());

const startServer = async() =>{
await connectDB();


// root get api
app.get("/", (req, res) =>{
   
    res.json({
        message: "SNS Server is running..."
    })
})


// user routers
app.use("/api/users", userRouter);


// global error handler
app.use(globalErrorHandler);

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
})
}

startServer();
