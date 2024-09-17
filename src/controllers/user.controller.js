import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // we will save the refresh token in the database to check if the access token of the user is expired and refresh token is available then we can provide user with a new access token
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});  // it means our db will not validate before saving as we have only provided with one field

        return {accessToken, refreshToken}

    }catch(error){
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
}

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
    // username
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

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0)
    {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

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
    console.log("Hello");
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


const loginUser = asyncHandler(async (req, res)=>{
    // get data from req.body
    // username or email
    // find the user 
    // check password
    // if password is correct then generate access and refresh token
    // send cookie

    const {email, username, password}  = req.body;

    if(!username && !email)
    {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user)
    {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid)
            throw new ApiError(404, "Invalid user credentials")

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    // options to send cookies  (by turning these options true now only server will be able to modify these cookies, and these cookies cannot be modified by frontend)
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})


const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true        // it means in response we will get the new updated value
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(
        200,
        {},
        "User logged out successfully"
    ))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if(!user)
        {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken!==user?.refreshToken)
        {
            throw new ApiError(401, "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken},
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
})

export {registerUser, loginUser, logoutUser, refreshAccessToken}