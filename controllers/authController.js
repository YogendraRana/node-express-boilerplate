import { User } from "../models/userModel.js";
import ErrorHandler from "../util/errorHandler.js"
import catchAsyncError from "../util/catchAsyncError.js";


// register controller
export const handleRegister = catchAsyncError(async (req, res, next) => {
    const { name, email, password, confirm_password } = req.body;
    if (password !== confirm_password) return next(new ErrorHandler('Password do not match.', 400));
    if (!name || !email || !password || !confirm_password) return next(new ErrorHandler('Please, provide the necessary input values.', 409));
    const isEmailUsed = await User.findOne({ email });
    if (isEmailUsed) return next(new ErrorHandler("Email is already used!", 400));

    const user = await User.create({ name, email, password });

    // create tokens
    const accessToken = user.createAccessToken('5min');
    const refreshToken = user.createRefreshToken();

    // save refresh token in database
    user.refreshToken = refreshToken;
    user.refreshTokenExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });

    res.status(201).json({
        success: true,
        message: 'User created successfully!',
        data: {
            user,
            accessToken,
        }
    });
})


// login controller
export const handleLogin = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(new ErrorHandler('Please enter all the fields!', 400));
    const foundUser = await User.findOne({ email });
    if (!foundUser) return next(new ErrorHandler('User does not exist!', 400));
    const passwordMatched = await foundUser.comparePassword(password);
    if (!passwordMatched) return next(new ErrorHandler('Invalid credentials!', 400));

    // create tokens 
    const accessToken = foundUser.createAccessToken('30s');
    const refreshToken = foundUser.createRefreshToken();

    // save refresh token in database
    foundUser.refreshToken = refreshToken;
    foundUser.refreshTokenExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await foundUser.save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });

    res.status(200).json({
        success: true,
        message: 'Logged in successfully!',
        data: {
            accessToken,
            user: foundUser
        }
    })
});


// logout controller
export const handleLogout = catchAsyncError(async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return next (new ErrorHandler('No token found!', 401));
    const foundUser = await User.findOne({ refreshToken: refreshToken });
    if (!foundUser) return next(new ErrorHandler('User does not exist!', 403));

    // delete refresh token from database
    foundUser.refreshToken = '';
    await foundUser.save();

    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully!'
    })
})