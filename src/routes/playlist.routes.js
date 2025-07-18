import { Router } from "express";
import { playlistAuth, verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createPlaylist);
router.route("/:playlistId")
    .get(getPlaylistById)
    .patch(playlistAuth, updatePlaylist)
    .delete(playlistAuth, deletePlaylist);
router.route("/user/:userId").get(getUserPlaylists);
router.route("/add/:videoId/:playlistId").patch(playlistAuth, addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(playlistAuth, removeVideoFromPlaylist);

export default router;
