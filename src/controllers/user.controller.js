import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import { User } from "../models/user.model.js";

const registerUser = asyncHandler( async (req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if username already exists
    // check for images and avatars
    // upload them to cloudinary
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response
    const {username, email, fullName, password} = req.body;
    
    if(
        [username, email, fullName, password].some((field)=>
            field?.trim()==="")  // checks if the fiels is empty or not
    ){
        throw new ApiError(400, "all fields are required")
    }

    const existingUser = User.findOne({
        $or: [{username}, {email}]  // checks if either or username or email already exists
    })  
    if(existingUser){
        throw new ApiError(409, "User already exists")
    }


})

export {registerUser}