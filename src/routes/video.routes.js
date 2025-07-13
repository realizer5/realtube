import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { publishVideo, getAllVideos } from "../controllers/video.controller.js";

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

export default router;
