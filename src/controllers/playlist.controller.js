import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Types } from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) throw new ApiError(400, "all fields are required");;
    const playlist = await Playlist.create({ title, description, owner: req.user._id });
    if (!playlist) throw new ApiError(500, "error while creating playlist");
    return res.status(200).json(new ApiResponse(200, playlist, "playlist created successfullY"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    let { userId } = req.params;
    if (!Types.ObjectId.isValid(userId)) throw new ApiError(400, "userid is not valid");
    userId = Types.ObjectId.createFromHexString(userId);
    const userPlaylists = await Playlist.aggregate([
        { $match: { owner: userId } },
    ]);
    if (!userPlaylists) throw new ApiError(400, "no playlist found with this userId");
    return res.status(200).json(new ApiResponse(200, userPlaylists, "user playlists fetched successfullY"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!Types.ObjectId.isValid(playlistId)) throw new ApiError(400, "playlistId is not valid");
    const playlist = await Playlist.findById(playlistId);
    if (!playlistId) throw new ApiError(400, "playlist does not exist");
    return res.status(200).json(new ApiResponse(200, playlist, "playlist fetched successfullY"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!Types.ObjectId.isValid(videoId)) throw new ApiError(400, "videoId is not valid");
    const playlist = await Playlist.findByIdAndUpdate(req.playlist._id, { $addToSet: { videos: videoId } },
        { new: true });
    if (!playlist) throw new ApiError(400, "playlist not found");
    return res.status(200).json(new ApiResponse(200, playlist, "video added to playlist successfullY"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!Types.ObjectId.isValid(videoId)) throw new ApiError(400, "videoId is not valid");
    const playlist = await Playlist.findByIdAndUpdate(req.playlist._id, { $pull: { videos: videoId } },
        { new: true });
    if (!playlist) throw new ApiError(400, "playlist not found");
    return res.status(200).json(new ApiResponse(200, playlist, "video removed to playlist successfullY"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    try {
        await req.playlist.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "playlist deleted successfully"));
    } catch (error) {
        throw new ApiError(500, error?.message || "error while deleting playlist")
    }
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) throw new ApiError(400, "title and description is required");
    const playlist = await Playlist.findByIdAndUpdate(req.playlist._id, { $set: { title, description } },
        { new: true });
    if (!playlist) throw new ApiError(500, "error while updating playlist");
    return res.status(200).json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

export {
    createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist,
    deletePlaylist, updatePlaylist
}
