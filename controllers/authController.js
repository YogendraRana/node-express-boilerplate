import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import ErrorHandler from "../util/errorHandler.js"
import catchAsyncError from "../util/catchAsyncError.js";


// register controller
export const handleRegister = catchAsyncError(async (req, res, next) => {
    const { name, email, password, confirm_password } = req.body;
    if(password !== confirm_password) return next(new ErrorHandler('Password do not match.', 400));
    if(!name || !email || !password || !confirm_password) return next(new ErrorHandler('Please, provide the necessary input values.', 409)); 
    const isEmailUsed = await User.findOne({email});
    if (isEmailUsed) return next(new ErrorHandler("Email is already used!", 400));
    
    const user = await User.create({ name, email, password });
    
    res.status(201).json({
        success: true,
        message: 'User created successfully!',
        user
    });
})


// login controller
export const handleLogin = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(new ErrorHandler('Please enter all the fields!', 400));
    const foundUser = await User.findOne({ email }).select('+password -createdAt');
    if (!foundUser) return next(new ErrorHandler('User does not exist!', 400));
    const passwordMatched = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatched) return next(new ErrorHandler('Invalid credentials!', 400));

    const accessToken = jwt.sign({ _id: foundUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' });
    const refreshToken = jwt.sign({ _id: foundUser._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

    foundUser.refreshTokens = refreshToken;
    await foundUser.save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });
    res.status(200).json({
        success: true,
        message: 'Logged in successfully!',
        accessToken
    })
});


// logout controller
export const handleLogout = catchAsyncError(async (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.status(204).json({message: 'No token found!'});
    const foundUser = await User.findOne({ refreshTokens: cookies.refreshToken });
    if (!foundUser) return next(new ErrorHandler('User does not exist!', 403));
    foundUser.refreshTokens = '';
    await foundUser.save();
    res.clearCookie('refreshToken', {httpOnly: true, secure: true, sameSite: 'none'});
    res.status(200).json({
        success: true, 
        message: 'Logged out successfully!'
    })
})


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