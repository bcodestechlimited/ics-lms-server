import {Router} from "express";
import {adminController} from "../controllers/admin.controller";
import {certificateController} from "../controllers/certificate.controller";
import {checkUserRole, isAuthenticated} from "../Middlewares/Auth";
import validateRequest from "../Middlewares/validation.middleware";
import {
  AdminAcceptUserRequestForCourseExtensionSchema,
  AdminRejectUserRequestForCourseExtensionSchema,
} from "../Schema/admin.schema";
import {authController} from "../controllers/auth.controller";
import {apiLimiter} from "../Middlewares/RateLimiter";

const router = Router();

router.post(
  "/upload-certificate-template",
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  adminController.uploadCertificateTemplate
);

router.get(
  "/user-request-for-course-extension",
  apiLimiter,
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  adminController.getUserRequestForCourseExtension
);

router.post(
  "/accept-request-for-course-extension",
  apiLimiter,
  validateRequest(AdminAcceptUserRequestForCourseExtensionSchema),
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  adminController.handleAcceptUserRequestForCourseExtension
);

router.patch(
  "/reject-request-for-course-extension",
  apiLimiter,
  validateRequest(AdminRejectUserRequestForCourseExtensionSchema),
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  adminController.handleRejectUserRequestForCourseExtension
);

router.post(
  "/test-issue-certificate",
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  certificateController.testIssueCertificate
);

router.patch(
  "/users/:id/toggle-status",
  apiLimiter,
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  authController.suspendUserAccount
);

export default router;
