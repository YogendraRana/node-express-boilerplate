import jwt from "jsonwebtoken";
import  { User } from '../models/userModel.js'
import ErrorHandler from "../util/errorHandler.js";

export const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) return next(new ErrorHandler("Unauthorized", 401));
    const accessToken = authHeader.split(' ')[1];
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if(err) return next(new ErrorHandler("Forbidden", 403));
        req.user = await User.findById(decoded._id);
        next();
    })
}


// refresh token controller
export const handleRenewAccessToken = async (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return next(new ErrorHandler("No token found!", 401));
    const foundUser = await User.findOne({ refreshTokens: cookies.refreshToken });
    if (!foundUser) return next(new ErrorHandler('User does not exist!', 403));

    jwt.verify(cookies.refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if(err || decoded._id !== foundUser._id) return next(new ErrorHandler('Invalid token!', 403));
        const accessToken = jwt.sign({_id: decoded._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30s'});
        res.status(200).json({
            success: true,
            accessToken
        });
    });
}