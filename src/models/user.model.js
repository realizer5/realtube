import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: [true, "Fullname is required"],
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudinary url
        required: [true, "Avatar is required"]
    },
    coverImage: {
        type: String // cloudinary url
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true });

// don't use arrow function here cause it needs this keyword
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 10);
    next();
});

userSchema.method.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.method.generateAccessToken = function() {
    return jwt.sign({ _id: this._id, email: this.email, username: this.username, fullName: this.fullName },
        process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
};

userSchema.method.generateRefreshToken = function() {
    return jwt.sign({ _id: this._id, },
        process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
};

export const User = model("User", userSchema);
