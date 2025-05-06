import {Router} from "express";
import {isLocalAuthenticated} from "../Middlewares/Auth";
import {progressController} from "../controllers/progress.controller";

const router = Router();

router.get(
  "/course/:courseId",
  isLocalAuthenticated,
  progressController.getCourseProgress
);

export default router;
