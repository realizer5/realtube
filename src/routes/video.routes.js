import { Router } from "express";
import { verifyJWT, videoAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { publishVideo, getAllVideos, getVideoById, deleteVideo, updateVideo, togglePublishStatus } from "../controllers/video.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            { name: "videoFile", maxCount: 1, },
            { name: "thumbnail", maxCount: 1, },
        ]),
        publishVideo
    );
router.route("/:videoId")
    .get(getVideoById)
    .delete(videoAuth, deleteVideo)
    .patch(videoAuth, upload.single("thumbnail"), updateVideo)

router.route("/toggle/publish/:videoId").patch(videoAuth, togglePublishStatus);

export default router;
