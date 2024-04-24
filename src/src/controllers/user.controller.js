import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js"
import { uplaodOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if(!user){
            throw new ApiError(500,"Something went wrong while generating token.")
        }
        const refreshToken = user?.getRefreshToken()
        const accessToken = user?.getAccessToken()
        user.refreshToken = refreshToken
        await user.save({
            validateBeforeSave: false
        })
        return { refreshToken, accessToken }

    } catch (error) {
        throw new ApiError(error?.status || 500, error?.message || "Something went wrong while generating token.")
    }
}

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
    if (Array.isArray(req?.files?.coverPhoto) && req?.files?.coverPhoto[0]?.length > 0) {
        coverPhotoLocalpath = req?.files?.coverPhoto[0]?.path
    }
    // console.log(req?.files);
    if (!avatarLocalpath) {
        console.log("local avatar error");
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uplaodOnCloudinary(avatarLocalpath)
    let coverPhoto;
    if (coverPhotoLocalpath) {
        coverPhoto = await uplaodOnCloudinary(coverPhotoLocalpath)
    }
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

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, "User created successfully", createdUser)
    )
})

const loginUser = asyncHandler(async (req, res) => {
    // get email, username, password
    // check for email/username
    // validate credentials
    // generate tokens
    // save refreshToken into userSchema
    // save tokens in cookie
    // send response

    const { email, userName, password } = req.body
    console.log(email, password);
    if (!email && !userName) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{ email }, { userName }]
    })

    if (!user) {
        throw new ApiError(404, "No account is found with this username or email")
    }

    const validatedUser = await user?.isPasswordCorrect(password)

    if (!validatedUser) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user?._id)

    const loggedinUser = await User.findById(user?._id).select("-password")
    console.log(accessToken);
    loggedinUser['accessToken'] = accessToken;

    console.log(loggedinUser);

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, "Logged in successfully", {user:loggedinUser,accessToken})
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,"Logged out successfully.",{})
    )

})

export { registerUser, loginUser, logoutUser }