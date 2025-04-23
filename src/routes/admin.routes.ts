import {Router} from "express";
import {adminController} from "../controllers/admin.controller";
import {certificateController} from "../controllers/certificate.controller";
import {checkUserRole, isAuthenticated} from "../Middlewares/Auth";
import validateRequest from "../Middlewares/validation.middleware";
import {
  AdminAcceptUserRequestForCourseExtensionSchema,
  AdminRejectUserRequestForCourseExtensionSchema,
} from "../Schema/admin.schema";

const router = Router();

// test: this endpoint
router.post(
  "/upload-certificate-template",
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  adminController.uploadCertificateTemplate
);

// test: this endpoint
router.post(
  "/send-certificate",
  isAuthenticated,
  checkUserRole(["admin", "superamdin"]),
  certificateController.sendCompletionCertificate
);

router.get(
  "/user-request-for-course-extension",
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  adminController.getUserRequestForCourseExtension
);

router.post(
  "/accept-request-for-course-extension",
  validateRequest(AdminAcceptUserRequestForCourseExtensionSchema),
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  adminController.handleAcceptUserRequestForCourseExtension
);

router.patch(
  "/reject-request-for-course-extension",
  validateRequest(AdminRejectUserRequestForCourseExtensionSchema),
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  adminController.handleRejectUserRequestForCourseExtension
);

export default router;
