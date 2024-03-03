import { app } from "./app.js";
import connectDB from "./db/dbConnect.js";
// require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
dotenv.config({path:'./env'})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`App is listening on port:${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log(error);
})























// import express from "express";
// const app = express()
// (async()=>{
// try {
//   await mongoose.connect(`${process.env.MONGODB_URI}/${DB}`)
//   app.on('error',(error)=>{
//     throw error 
//   })
// } catch (error) {
//     console.log(error);
// }
// })()