import catchAsyncError from "../util/catchAsyncError.js";

export const getUsers = catchAsyncError(async (req, res, next) => {

    res.status(200).json({
        success: true,
        message: "Welcome to admin route!"
    })
})