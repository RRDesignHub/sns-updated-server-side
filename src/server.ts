import express from "express";
import { config } from "./config/config";


const port = config.port || 3000;

const app = express();

app.get("/", (req, res) =>{
    res.json({
        message: "SNS Server is running..."
    })
})


app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
})