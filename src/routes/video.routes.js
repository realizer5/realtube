import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { publishVideo, getAllVideos, getVideoById, deleteVideo, updateVideo, togglePublishStatus } from "../controllers/video.controller.js";
import { videoAuthority } from "../middlewares/videoAuthority.middleware.js";

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
    .delete(videoAuthority, deleteVideo)
    .patch(videoAuthority, upload.single("thumbnail"), updateVideo)

router.route("/toggle/publish/:videoId").patch(videoAuthority, togglePublishStatus);

export default router;
