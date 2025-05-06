import express from "express";
import {analyticsController} from "../controllers/analytics.controller";
import {checkUserRole, isLocalAuthenticated} from "../Middlewares/Auth";

const router = express.Router();

router.get(
  "/courses/course-analytics",
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  analyticsController.getCoursesCreatedOverTime
);

router.get(
  "/courses/created-over-time",
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  analyticsController.getCoursesCreatedOverTime
);

router.get(
  "/courses/by-category",
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  analyticsController.getCoursesByCategory
);

router.get(
  "/courses/skill-distribution",
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  analyticsController.getSkillLevelDistribution
);

router.get(
  "/courses/enrollments",
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  analyticsController.getEnrollmentCounts
);

router.get(
  "/courses/top-enrolled",
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  analyticsController.getTopEnrolledCourses
);

export default router;
