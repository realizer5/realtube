import { Types } from "mongoose";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!Types.ObjectId.isValid(videoId)) throw new ApiError(400, "videoId is not valid");
    const existingLike = await Like.exists({ video: videoId, likedBy: req.user._id });
    if (existingLike) {
        const unlike = await Like.findByIdAndDelete(existingLike._id);
        if (!unlike) throw new ApiError(500, "error while unliking video");
        return res.status(200).json(new ApiResponse(200, {}, "video unliked succesfully"));
    }
    const likedVideo = await Like.create({ video: videoId, likedBy: req.user._id });
    if (!likedVideo) throw new ApiError(500, "error while liking video");
    return res.status(200).json(new ApiResponse(200, likedVideo, "video liked succesfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!Types.ObjectId.isValid(commentId)) throw new ApiError(400, "commentId is not valid");
    const existingLike = await Like.exists({ comment: commentId, likedBy: req.user._id });
    if (existingLike) {
        const unlike = await Like.findByIdAndDelete(existingLike._id);
        if (!unlike) throw new ApiError(500, "error while unliking comment");
        return res.status(200).json(new ApiResponse(200, {}, "comment unliked succesfully"));
    }
    const likedComment = await Like.create({ comment: commentId, likedBy: req.user._id });
    if (!likedComment) throw new ApiError(500, "error while liking video");
    return res.status(200).json(new ApiResponse(200, likedComment, "video liked succesfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!Types.ObjectId.isValid(tweetId)) throw new ApiError(400, "commentId is not valid");
    const existingLike = await Like.exists({ tweet: tweetId, likedBy: req.user._id });
    if (existingLike) {
        const unlike = await Like.findByIdAndDelete(existingLike._id);
        if (!unlike) throw new ApiError(500, "error while unliking tweet");
        return res.status(200).json(new ApiResponse(200, {}, "tweet unliked succesfully"));
    }
    const likedTweet = await Like.create({ tweet: tweetId, likedBy: req.user._id });
    if (!likedTweet) throw new ApiError(500, "error while liking video");
    return res.status(200).json(new ApiResponse(200, likedTweet, "video liked succesfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = Types.ObjectId.createFromHexString(String(req.user?._id));
    const { page = 1, limit = 10 } = req.params;
    const options = { page, limit };
    const aggregate = Like.aggregate([
        { $match: { likedBy: userId, video: { $exists: true } } },
        {
            $lookup: {
                from: "videos", localField: "video", foreignField: "_id", as: "videos",
                pipeline: [
                    { // extracts owner from videos
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
    const likedVideos = await Like.aggregatePaginate(aggregate, options);
    if (!likedVideos) throw new ApiError(500, "error while fetching liked videos");
    return res.status(200).json(new ApiResponse(200, likedVideos, "liked videos fetched succesfully"));
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
