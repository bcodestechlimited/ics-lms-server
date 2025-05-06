import express from "express";
import {templateController} from "../controllers/template.controller";
import {checkUserRole, isLocalAuthenticated} from "../Middlewares/Auth";
import {apiLimiter} from "../Middlewares/RateLimiter";

const router = express.Router();

router.post(
  "/create-from-course/:courseId",
  apiLimiter,
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  templateController.createTemplateFromCourse
);

router.post(
  "/:templateId/create-course",
  apiLimiter,
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  templateController.createCourseFromTemplate
);

router.get(
  "/",
  apiLimiter,
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  templateController.getAllTemplates
);

router.get(
  "/:id",
  apiLimiter,
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  templateController.getTemplateById
);

export default router;
