import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () =>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`Database connected:\nDB HOST:${connectionInstance.connection.host}`);
    }
    catch(error){
        console.log("MongoDB connection error: ",error);
        process.exit(1);  // to exit the process
    }
}

export default connectDB;