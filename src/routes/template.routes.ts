import express from "express";
import { templateController } from "../controllers/template.controller";
import { apiLimiter } from "../Middlewares/RateLimiter";
import { checkUserRole, isAuthenticated } from "../Middlewares/Auth";

const router = express.Router();

router.post(
  "/create-from-course/:courseId",
  apiLimiter,
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  templateController.createTemplateFromCourse
);

router.post(
  "/:templateId/create-course",
  apiLimiter,
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  templateController.createCourseFromTemplate
);

router.get(
  "/",
  apiLimiter,
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  templateController.getAllTemplates
);

router.get(
  "/:id",
  apiLimiter,
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  templateController.getTemplateById
);

export default router;
