import express, { Request, Response } from "express";
import { apiLimiter } from "../Middlewares/RateLimiter";
import BCTCourseController, {
  bctCourseController,
} from "../controllers/bct-course.controller";

const router = express.Router();

router.route("/").get(apiLimiter, bctCourseController.getCourses);

router.route("/:id").get(apiLimiter, bctCourseController.getCourseById);

export default router;
