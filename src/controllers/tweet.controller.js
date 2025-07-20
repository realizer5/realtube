import { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (!content) throw new ApiError(400, "content is required");
    const tweet = await Tweet.create({ content, owner: req.user?._id });
    if (!tweet) throw new ApiError(500, "could not create tweet");
    return res.status(200).json(new ApiResponse(200, tweet, "tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) throw new ApiError(400, "user id is not valid");
    const tweets = await Tweet.find({ owner: userId }).populate("owner", "fullName username avatar");
    if (!tweets) throw new ApiError(500, "error while fetching tweets");
    return res.status(200).json(new ApiResponse(200, tweets, "tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "tweet id is not valid");
    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, { $set: { content } },);
    if (!updatedTweet) throw new ApiError(500, "error while updating tweet");
    return res.status(200).json(new ApiResponse(200, updatedTweet, "tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    try {
        await req.tweet.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "tweet deleted successfully"));
    } catch (error) {
        throw new ApiError(500, error?.message || "error while deleting tweet")
    }
})

export { createTweet, getUserTweets, updateTweet, deleteTweet }
