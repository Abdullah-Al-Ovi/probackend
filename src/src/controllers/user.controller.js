import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js"
import { uplaodOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user's data: username, fullName, email, avatar, coverPhoto, password
    // validation - not empty
    // if user already exist - userName,email
    // files:avatar check and upload on cloudinary 
    // store in db
    // return res without pass,token
    const { userName, fullName, email, password } = req.body
    // console.log(email);
    if ([userName, fullName, email, password].some((field) => 
        field?.trim() === ""
    )) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with same username or email already exists")
    }

    const avatarLocalpath = req?.files?.avatar[0]?.path
    let coverPhotoLocalpath;
    if(Array.isArray(req?.files?.coverPhoto) && req?.files?.coverPhoto[0]?.length > 0){
         coverPhotoLocalpath = req?.files?.coverPhoto[0]?.path
    }
    // console.log(req?.files);
    if (!avatarLocalpath) {
        console.log("local avatar error");
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uplaodOnCloudinary(avatarLocalpath)
    let coverPhoto;
    if(coverPhotoLocalpath){
     coverPhoto = await uplaodOnCloudinary(coverPhotoLocalpath)}
    // console.log(avatar);
    if (!avatar) {
        console.log("cloud avatar error");
        throw new ApiError(400, "Avatar file is required")
        
    }

    const user = await User.create({
        userName: userName?.toLowerCase(),
        fullName, 
        email, 
        password,
        avatar: avatar.url,
        coverPhoto: coverPhoto?.url || ""
    })

    const createdUser = await User.findById(user?._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,"User created successfully",createdUser)
    )
})

export { registerUser }