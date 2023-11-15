import jwt from "jsonwebtoken";
import { User } from '../models/userModel.js'
import ErrorHandler from "../util/errorHandler.js";

export const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next(new ErrorHandler("Bearer token is absent!", 401));
    const accessToken = authHeader.split(' ')[1];
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                const refreshToken = req.cookies.refreshToken;

                if (!refreshToken) {
                    return next(new ErrorHandler("Access token expired. No refresh token available. Please, login again!", 401));
                }

                const foundUser = await User.findOne({ refreshToken: refreshToken });
                if (!foundUser) return next(new ErrorHandler("User does not exist!", 403));

                try {
                    const accessToken = foundUser.createAccessToken('30s');
                    res.status(200).json({
                        success: true,
                        data: {
                            accessToken
                        }
                    });
                } catch (error) {
                    return next(new ErrorHandler("Failed to refresh access token.", 500));
                }
            };

            return next(new ErrorHandler("Forbidden", 403))
        };

        req.user = await User.findById(decoded._id);
        next();
    })
}