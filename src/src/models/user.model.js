import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const { Schema } = mongoose; 
const userSchema = new Schema({ 
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        // lowercase: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,
        required: true,
    },
    coverPhoto: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next(); // Fixed condition here
    try {
        this.password = await bcrypt.hash(this.password,10)
        next()
    } catch (error) {
        next(error)
    }
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.getAccessToken = function(){
   return jwt.sign(
        {
            _id : this._id,
            email: this.email,
            userName : this.userName,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY_DURATION
        }
        )
}
userSchema.methods.getRefreshToken = function(){
    return jwt.sign(
         {
             _id : this._id,
         },
         process.env.REFRESH_TOKEN_SECRET,
         {
             expiresIn: process.env.REFRESH_TOKEN_EXPIRY_DURATION
         }
         )
 }
export const User = mongoose.model('User', userSchema)
