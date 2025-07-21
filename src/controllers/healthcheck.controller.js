import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (_req, res) => {
    try {
        return res.status(200).json(new ApiResponse(200, {}, "server is working"));
    } catch (error) {
        throw new ApiError(500, "server healthcheck failed");
    }
})

export { healthcheck }

