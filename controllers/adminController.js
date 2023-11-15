import { User } from "../models/userModel.js";
import catchAsyncError from "../util/catchAsyncError.js";

export const getUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find({}).select('-password -refreshTokens -createdAt -updatedAt');

    res.status(200).json({
        success: true,
        message: "Welcome to admin route!",
        data: {
            users
        }
    })
})