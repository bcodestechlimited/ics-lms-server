import express from "express";
import {checkUserRole, isAuthenticated} from "../Middlewares/Auth";
import {apiLimiter} from "../Middlewares/RateLimiter";
import {analyticsController} from "../controllers/analytics.controller";

const router = express.Router();

router.get(
  "/courses/course-analytics",
  apiLimiter,
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  analyticsController.getCoursesCreatedOverTime
);

router.get(
  "/courses/created-over-time",
  apiLimiter,
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  analyticsController.getCoursesCreatedOverTime
);

router.get(
  "/courses/by-category",
  apiLimiter,
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  analyticsController.getCoursesByCategory
);

router.get(
  "/courses/skill-distribution",
  apiLimiter,
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  analyticsController.getSkillLevelDistribution
);

router.get(
  "/courses/enrollments",
  apiLimiter,
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  analyticsController.getEnrollmentCounts
);

router.get(
  "/courses/top-enrolled",
  apiLimiter,
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  analyticsController.getTopEnrolledCourses
);

export default router;
