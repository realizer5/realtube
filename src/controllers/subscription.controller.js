import { Types } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!Types.ObjectId.isValid(channelId)) throw new ApiError(400, "channelId is not valid");
    const existingSub = await Subscription.exists({ channel: channelId, subscriber: req.user._id });
    if (existingSub) {
        const unSub = await Subscription.findByIdAndDelete(existingSub._id);
        if (!unSub) throw new ApiError(500, "error while unsubscribing channel");
        return res.status(200).json(new ApiResponse(200, {}, "channel unsubscribed succesfully"));
    }
    const susbcribe = await Subscription.create({ channel: channelId, subscriber: req.user._id });
    if (!susbcribe) throw new ApiError(500, "error while susbcribing channel");
    return res.status(200).json(new ApiResponse(200, susbcribe, "channel subscribed succesfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    let { channelId } = req.params;
    if (!Types.ObjectId.isValid(channelId)) throw new ApiError(400, "channelId is not valid");
    channelId = Types.ObjectId.createFromHexString(channelId);
    const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber", "fullName username avatar");
    if (!subscribers) throw new ApiError(500, "error while fetching subscribers");
    return res.status(200).json(new ApiResponse(200, subscribers, "subscribers fetched succesfully"));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscribedChannels = await Subscription.find({ subscribe: req.user?._id }).populate("owner", "fullName username avatar");
    if (!subscribedChannels) throw new ApiError(500, "error while fetching subscribed channels");
    return res.status(200).json(new ApiResponse(200, subscribedChannels, "subscribed channels fetched succesfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
