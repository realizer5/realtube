import { Router } from "express";
import { verifyJWT, commentAuth } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router();


router.use(verifyJWT); // apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(commentAuth, deleteComment).patch(commentAuth, updateComment);

export default router;
