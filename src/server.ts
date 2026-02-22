import express from "express";
import { config } from "./config/config";
import connectDB from "./config/db.config";


const app = express();
const port = config.port || 3000;

const startServer = async() =>{
await connectDB();

app.get("/", (req, res) =>{
    res.json({
        message: "SNS Server is running..."
    })
})


app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
})
}

startServer();
