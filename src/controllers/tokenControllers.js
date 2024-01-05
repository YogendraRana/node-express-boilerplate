import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import asyncHandler from "../util/asyncHandler.js";
import ErrorHandler from "../util/errorHandler.js";

export const handleRefreshToken = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return next(new ErrorHandler("Token is unavailable. Please login to continue!", 401));

    const user = await User.findOne({ refreshToken });
    if (!user) return next(new ErrorHandler("User not found. Please login to continue!", 403));

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err || decoded._id.toString() !== user._id.toString()) return next(new ErrorHandler("Invalid token. Please login to continue!", 403));

        const accessToken = user.createAccessToken();
        res.status(200).json({
            success: true,
            message: "Access token generated successfully!",
            data: {
                accessToken
            }
        })
    })
});