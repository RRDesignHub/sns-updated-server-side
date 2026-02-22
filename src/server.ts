import express from "express";
import { config } from "./config/config";
import connectDB from "./config/db.config";
import globalErrorHandler from "./middlewares/globalErrorHandaler";



const app = express();
const port = config.port || 3000;

const startServer = async() =>{
await connectDB();

app.get("/", (req, res) =>{
   
    res.json({
        message: "SNS Server is running..."
    })
})


// global error handler
app.use(globalErrorHandler);

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
})
}

startServer();
