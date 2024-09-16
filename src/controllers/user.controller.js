import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

    const existingUser = await User.findOne({
        $or: [{username}, {email}]  // checks if either or username or email already exists
    })  
    if(existingUser){
        throw new ApiError(409, "Username or Email already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath)
            throw new ApiError(400, "Avatar is required")

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar)
            throw new ApiError(400, "Avatar is required")

    const user = await User.create({
        username, 
        email,
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })
    
    // finding if user is created or not
    const createdUser = await User.findById(user._id).select(  // the fields written inside select will not be displayed/selected
        "-password -refreshToken"
    )
    
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export {registerUser}