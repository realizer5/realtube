import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { deleteImageOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

const options = { httpOnly: true, secure: true };

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    const { fullName, email, username, password } = req.body;
    // validation - not empty
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    // check if user already exists: username, email
    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) throw new ApiError(409, "User with email or username already exists");
    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if (!avatarLocalPath) throw new ApiError(400, "avatar is required");
    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) throw new ApiError(400, "error while uploading avatar");
    // create user object - create entry in db
    const user = await User.create({
        fullName, avatar: avatar.url, coverImage: coverImage?.url || "", email, password,
        username: username.toLowerCase()
    });
    // remove password and refresh token field from response
    // check for user creation
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) throw new ApiError(500, "something went wrong while registring uesr");
    // return response
    return res.status(201).json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access token");
    }
};

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    const { email, username, password } = req.body;
    // username or email
    if (!username && !email) throw new ApiError(400, "username or email is required");
    // find the user
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) throw new ApiError(404, "user does not exist");
    // password check
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, "invalid user credentials");
    // access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    // send cookies
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    return res.status(200).cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken },
            "user logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, "unauthorized request");
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);
        if (!user) throw new ApiError(401, "invalid refresh token");
        if (incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, "refresh token is expired or used");
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        return res.status(200).cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) throw new ApiError(400, "invalid old password");
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) throw new ApiError(400, "all fields are required");
    const user = await User.findByIdAndUpdate(req.user?._id, { $set: { fullName, email } }, { new: true })
        .select("-password");
    return res.status(200).json(new ApiResponse(200, user, "account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) throw new ApiError(400, "avatar file is missing");
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) throw new ApiError(400, "error while uploading avatar");
    deleteImageOnCloudinary(req.user.avatar);
    const user = await User.findByIdAndUpdate(req.user?._id, { $set: { avatar: avatar.url } }, { new: true })
        .select("-password");
    res.status(200).json(new ApiResponse(200, user, "avatar image updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) throw new ApiError(400, "cover image file is missing");
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) throw new ApiError(400, "error while uploading cover image");
    deleteImageOnCloudinary(req.user.coverImage);
    const user = await User.findByIdAndUpdate(req.user?._id, { $set: { coverImage: coverImage.url } }, { new: true })
        .select("-password");
    res.status(200).json(new ApiResponse(200, user, "cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) throw new ApiError(400, "username is missing");
    const channel = await User.aggregate([
        { $match: { username: username?.toLowerCase() } },
        { $lookup: { from: "subscriptions", localField: "_id", foreignField: "channel", as: "subscribers" } },
        { $lookup: { from: "subscriptions", localField: "_id", foreignField: "subscriber", as: "subscribedTo" } },
        {
            $addFields:
            {
                subscribersCount: { $size: "$subscribers" }, channelsSubscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $cond: { if: { $in: [req.user?._id, "$subscribers.subscriber"] }, then: true, else: false }
                }
            }
        },
        {
            $project:
            {
                fullName: 1, username: 1, subscribersCount: 1, channelsSubscribedToCount: 1,
                isSubscribed: 1, avatar: 1, coverImage: 1, email: 1,
            }
        }
    ]);
    if (!channel?.length) throw new ApiError(404, "channel does not exist");
    return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        { $match: { _id: Types.ObjectId.createFromTime(req.user._id) } },
        {
            $lookup: {
                from: "videos", localField: "watchHistory", foreignField: "_id", as: "watchHistory",
                pipeline: [
                    { // extracts owner from videos document got from watchHistory
                        $lookup: {
                            from: "users", localField: "owner", foreignField: "_id", as: "owner",
                            pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }]
                        }
                    },
                    { $addFields: { owner: { $first: "$owner" } } } // overwrites owner field and gives first value of response Array
                ]
            }
        },
    ]);
    return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "WatchHistory fetched successfully"));
});

export {
    registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, changeCurrentPassword,
    updateUserAvatar, updateAccountDetails, updateUserCoverImage, getUserChannelProfile, getWatchHistory
};
