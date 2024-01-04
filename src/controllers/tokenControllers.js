import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import catchAsyncError from "../util/catchAsyncError.js";

export const handleRefreshToken = catchAsyncError(async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return next(new ErrorHandler("Please login to continue!", 401));

    const user = await User.findOne({ refreshToken });
    if (!user) return next(new ErrorHandler("Please login to continue!", 403));

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err || decoded._id !== user._id) return next(new ErrorHandler("Please login to continue!", 403));

        const accessToken = user.createAccessToken('1d');
        res.status(200).json({
            success: true,
            message: "Access token generated successfully!",
            data: {
                accessToken
            }
        })
    })
});