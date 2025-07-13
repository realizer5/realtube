import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getVideoComments } from "../controllers/comment.controller";

const router = Router();


router.use(verifyJWT); // apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments);
