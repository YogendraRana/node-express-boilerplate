import jwt from "jsonwebtoken";
import { User } from '../models/userModel.js'
import ErrorHandler from "../util/errorHandler.js";

export const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next(new ErrorHandler("Bearer token is unavailable!", 401));
    const accessToken = authHeader.split(' ')[1];
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            return next(new ErrorHandler("Forbidden", 403))
        };

        req.user = await User.findById(decoded._id);
        next();
    })
};