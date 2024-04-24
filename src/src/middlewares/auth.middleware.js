import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyToken = asyncHandler(async (req, _, next) => {
   try {
     const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
     if (!accessToken) {
         throw new ApiError(401,"User unauthorized")
     }
 
     const decodedToken = await jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
 
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
 
     if(!user){
         throw new ApiError(401,"Invalid access token")
     }
 
     req.user = user
     next()
   } catch (error) {
     throw new ApiError(error?.status || 401, error?.message || "Invalid access token")
   }

})