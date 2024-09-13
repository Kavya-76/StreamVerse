// require("dotenv").config({path: './env'})  either you can use this syntax or the below syntax
import dotenv from "dotenv";
dotenv.config({
    path: "./env"
})

import connectDB from "./db/index.js";
import express from "express";
const app = express();


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MongoDB connection failed",error);
})














































/*
IIFE expression

import express from "express";
const app = express();

(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error)=>{
            console.log("ERROR", error);
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    }catch(error){
        console.log("ERROR: ",error);
        throw err
    }
})()
*/