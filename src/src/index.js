import connectDB from "./db/dbConnect.js";
// require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
dotenv.config({path:'./env'})

connectDB()
























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