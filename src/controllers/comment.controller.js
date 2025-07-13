import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const comments = await Comment.aggregate([
        { $match: { video: videoId } },
    ]);
    console.log(comments);
});


export { getVideoComments };
