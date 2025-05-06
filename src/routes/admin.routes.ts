import {Router} from "express";
import {adminController} from "../controllers/admin.controller";
import {certificateController} from "../controllers/certificate.controller";
import {
  checkUserRole,
  isAuthenticated,
  isLocalAuthenticated,
} from "../Middlewares/Auth";
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
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  adminController.uploadCertificateTemplate
);

router.post(
  "/create-admin-account",
  apiLimiter,
  isLocalAuthenticated,
  checkUserRole(["superadmin"]),
  adminController.createAdminAccount
);

router.get(
  "/user-request-for-course-extension",
  apiLimiter,
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  adminController.getUserRequestForCourseExtension
);

router.post(
  "/accept-request-for-course-extension",
  apiLimiter,
  validateRequest(AdminAcceptUserRequestForCourseExtensionSchema),
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  adminController.handleAcceptUserRequestForCourseExtension
);

router.patch(
  "/reject-request-for-course-extension",
  apiLimiter,
  validateRequest(AdminRejectUserRequestForCourseExtensionSchema),
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  adminController.handleRejectUserRequestForCourseExtension
);

router.post(
  "/test-issue-certificate",
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  certificateController.testIssueCertificate
);

router.patch(
  "/users/:id/toggle-status",
  apiLimiter,
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  authController.suspendUserAccount
);

export default router;
