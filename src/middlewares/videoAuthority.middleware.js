import { Types } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

export const videoAuthority = asyncHandler(async (req, _, next) => {
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
