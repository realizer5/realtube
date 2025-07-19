import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getSubscribedChannels);

router.route("/c/:channelId").post(toggleSubscription);
router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router;
