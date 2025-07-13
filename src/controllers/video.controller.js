import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    const aggregate = Video.aggregate([
        {
            $lookup: {
                from: "users", localField: "owner", foreignField: "_id", as: "owner",
                pipeline: [
                    { // extracts owner from videos document
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
    const video = await Video.aggregatePaginate(aggregate, options);
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


export { publishVideo, getAllVideos };
