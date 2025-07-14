import { Types } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;
    const options = { page: parseInt(page), limit: parseInt(limit), [sortBy]: sortType }
    let userIdObject = null;
    if (userId) userIdObject = Types.ObjectId.createFromHexString(userId);
    const match = {
        ...(query && { title: { $regex: query, $options: "i" } }),
        ...(userIdObject && { owner: userIdObject })
    };
    const aggregate = Video.aggregate([
        { $match: match },
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
    const videos = await Video.aggregatePaginate(aggregate, options);
    return res.status(200).json(new ApiResponse(200, videos, "videos fetched successfully"));
});

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) throw new ApiError(400, "title and description are required");
    const videoFileLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    if (!videoFileLocalPath || !thumbnailLocalPath) throw new ApiError(400, "videoFile & thumbnail is required");
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!videoFile || !thumbnail) throw new ApiError(400, "error while uploading videoFile or thumbnail");
    const video = await Video.create({
        videoFile: videoFile?.url, thumbnail: thumbnail?.url, title, description,
        duration: videoFile.duration, owner: req.user?._id
    });
    const createdVideo = await Video.findById(video._id);
    if (!createdVideo) throw new ApiError(500, "something went wrong while creating video");
    // return response
    return res.status(201).json(new ApiResponse(200, createdVideo, "video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
});

export { publishVideo, getAllVideos, getVideoById };
