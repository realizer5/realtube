import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Types } from "mongoose"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = Types.ObjectId.createFromHexString(String(req.user._id));
    const subscribers = await Subscription.countDocuments({ channel: userId });
    if (!subscribers) throw new ApiError(500, "error while fetching subscribers count");
    const views = await Video.aggregate([
        { $match: { owner: userId } },
        { $group: { totalViews: { $sum: "$views" } } },
    ]);
    if (!views) throw new ApiError(500, "error while fetching views count");
    const totalViews = views[0]?.totalViews || 0;
    const videos = await Video.countDocuments({ owner: userId });
    const likes = await Like.aggregate([
        {
            $lookup: {
                from: "videos", localField: "video", foreignField: "_id", as: "video",
                pipeline: [{ $match: { owner: userId } },]
            }
        },
        { $count: "totalLikes" },
    ]);
    if (!likes) throw new ApiError(500, "error while fetching likes count");
    const totalLikes = likes[0]?.totalLikes || 0;
    return res.status(200).json(new ApiResponse(200, { subscribers, totalLikes, totalViews, videos },
        "channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = Types.ObjectId.createFromHexString(String(req.user._id));
    const aggregate = Video.aggregate([{ $match: { owner: userId } },]);
    const videos = await Video.aggregatePaginate(aggregate, options);
    if (!videos) throw new ApiError(500, "error while fetching videos");
    return res.status(200).json(new ApiResponse(200, videos, "all channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
