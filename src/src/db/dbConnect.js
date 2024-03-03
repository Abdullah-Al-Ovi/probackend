import mongoose from "mongoose";
import { DB } from "../constants.js";


const connectDB = async()=>{
    try {
        const connectionResponse = await mongoose.connect(`${process.env.MONGODB_URI}/${DB}`)
        // console.log(connectionResponse);
    } catch (error) {
        console.log('MongoDB Connection Error',error);
    }
}

export default connectDB;