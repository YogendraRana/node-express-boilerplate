import bcrypt from "bcrypt";
import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
    name: {type: String, required: [true, 'Please enter your name!']},
    email: {type: String, required: [true, 'Please enter your email!'], validate: validator.isEmail},
    password: { type: String, required: [true, 'Please enter the password!'], minLength: [6, "Password should be at least six characters long!"]},
    refreshTokens: {type: String},
    createdAt: {type: Date, default: Date.now},
})


// hash password
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) next();
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    return next();
})


export const User =  mongoose.model('User', userSchema);