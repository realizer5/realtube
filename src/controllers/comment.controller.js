import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { Types } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!Types.ObjectId.isValid(videoId)) throw new ApiError(400, "videoId is not valid");
    const { page = 1, limit = 10 } = req.query
    const options = { page, limit };
    const aggregate = Comment.aggregate([
        { $match: { video: Types.ObjectId.createFromHexString(videoId) } },
        {
            $lookup: {
                from: "users", localField: "owner", foreignField: "_id", as: "owner",
                pipeline: [
                    { $project: { fullName: 1, username: 1, avatar: 1 } },
                    { $addFields: { owner: { $first: "$owner" } } }, // overwrites owner field and gives first value of response Array
                ]
            }
        },
    ]);
    const comments = await Comment.aggregatePaginate(aggregate, options);
    if (!comments) throw new ApiError(500, "error while fetching comments");
    return res.status(200).json(new ApiResponse(200, comments, "comments fetched successfully"));
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!Types.ObjectId.isValid(videoId)) throw new ApiError(400, "videoId is not valid");
    const { content } = req.body;
    if (!content) throw new ApiError(400, "comment is required");
    const comment = await Comment.create({ content, video: videoId, owner: req.user?._id });
    if (!comment) throw new ApiError(500, "something went wrong while creating video");
    return res.status(200).json(new ApiResponse(200, comment, "comment created successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (!content) throw new ApiError(400, "comment is required");
    const comment = await Comment.findByIdAndUpdate(req.comment._id, { $set: { content } }, { new: true });
    if (!comment) throw new ApiError(400, "error while updating comment");
    return res.status(200).json(new ApiResponse(200, comment, "comment updated successfully"));
})

const deleteComment = asyncHandler(async (req, res) => {
    const deletedComment = await Comment.findByIdAndDelete(req.comment._id);
    if (!deletedComment) throw new ApiError(500, "error while deleting comment")
    return res.status(200).json(new ApiResponse(200, {}, "comment deleted successfully"));
})

export { getVideoComments, addComment, updateComment, deleteComment };
