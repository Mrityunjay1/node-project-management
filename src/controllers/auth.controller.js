import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Internal server error while generating access and refresh tokens")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body
    if ([username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    const user = await User.create({
        username,
        email,
        password,
        isEmailVerified: false
    })

    const { temporaryToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken
    user.emailVerificationTokenExpiry = tokenExpiry
    await user.save({ validateBeforeSave: false })

    await sendEmail({
        email: user.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailgenContent(user.username, `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${temporaryToken}`)
    })

    const createdUser = await User.findByIdAndUpdate(user._id).select(
        "-password -emailVerificationToken -emailVerificationTokenExpiry -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Internal server error while creating user")
    }
    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"))
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body
    if (!email && !username) {
        throw new ApiError(400, "Email or username is required")
    }
    if (!password) {
        throw new ApiError(400, "Password is required")
    }
    const user = await User.findOne({ $or: [{ email }, { username }] })
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $unset: {
            refreshToken: 1
        }
    }, {
        new: true
    })
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out successfully"))
})


const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const verifyEmail = asyncHandler(async (req, res) => {
    const { temporaryToken } = req.params
    if (!temporaryToken) {
        throw new ApiError(400, "Temporary token is required")
    }

    const user = await User.findOne({ temporaryToken })
    if (!user) {
        throw new ApiError(400, "Invalid temporary token")
    }
    if (user.emailVerificationExpiry < Date.now()) {
        throw new ApiError(400, "Temporary token expired")
    }
    user.isEmailVerified = true
    user.temporaryToken = undefined
    user.emailVerificationToken = undefined
    user.emailVerificationExpiry = undefined
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(200, user, "Email verified successfully"))
})

const resendEmailVerificationToken = asyncHandler(async (req, res) => {
    const { email } = req.body
    if (!email) {
        throw new ApiError(400, "Email is required")
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    if (user.isEmailVerified) {
        throw new ApiError(400, "Email already verified")
    }
    const { temporaryToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry
    await user.save({ validateBeforeSave: false })
    await sendEmail({
        email: user.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailgenContent(user.username, `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${temporaryToken}`)
    })
    return res.status(200).json(new ApiResponse(200, user, "Email verification token resent successfully"))
})



export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    verifyEmail
}
