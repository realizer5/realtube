import { Types } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) throw new ApiError(401, "unauthorized request");
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) throw new ApiError(401, "invalid access token");
        req.user = user; // cause it's middleware add in req
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

const commentAuth = asyncHandler(async (req, _, next) => {
    try {
        const { commentId } = req.params;
        if (!Types.ObjectId.isValid(commentId)) throw new ApiError(400, "Invalid commentId");
        const comment = await Comment.findById(commentId);
        if (!comment) throw new ApiError(400, "comment not found");
        if (!comment.owner.equals(req.user._id)) throw new ApiError(401, "user is not authorized to do this operation");
        req.comment = comment; // cause it's middleware add in req
        next();
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid commentId");
    }
});

const videoAuth = asyncHandler(async (req, _, next) => {
    try {
        const { videoId } = req.params;
        if (!Types.ObjectId.isValid(videoId)) throw new ApiError(400, "Invalid videoId");
        const video = await Video.findById(videoId);
        if (!video) throw new ApiError(400, "video not found");
        if (!video.owner.equals(req.user._id)) throw new ApiError(401, "user is not authorized to do this operation");
        req.video = video; // cause it's middleware add in req
        next();
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid videoId");
    }
});

const playlistAuth = asyncHandler(async (req, _, next) => {
    try {
        const { playlistId } = req.params;
        if (!Types.ObjectId.isValid(playlistId)) throw new ApiError(400, "Invalid playlistId");
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) throw new ApiError(400, "playlist not found");
        if (!playlist.owner.equals(req.user._id)) throw new ApiError(401, "user is not authorized to do this operation");
        req.playlist = playlist; // cause it's middleware add in req
        next();
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid playlistId");
    }
});

export { verifyJWT, commentAuth, videoAuth, playlistAuth }
