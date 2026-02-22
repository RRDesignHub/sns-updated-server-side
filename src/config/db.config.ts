import mongoose from "mongoose";
import { config } from "./config";



const connectDB = async() =>{
    try{
        mongoose.connection.on("connected", () =>{
            console.log("Connected to DB sucessfully");
        })

        mongoose.connection.on("error", () =>{
             console.log("Error in connecting DB");
        })
      await  mongoose.connect(config.databaseUrl as string)

  }catch(err){
    console.error("Failed to connect database", err);
    process.exit(1);
  }
}

export default connectDB;