import express from "express";
import multer from "multer";
import {courseController} from "../controllers/course.controller.ts";
import {checkUserRole, isAuthenticated} from "../Middlewares/Auth.ts";
import {apiLimiter} from "../Middlewares/RateLimiter.ts";
import {uploadCertificate, uploadFile} from "../Middlewares/upload-file.ts";
import validateRequest from "../Middlewares/validation.middleware.ts";
import {
  CreateCourseAssessmentSchema,
  CreateCourseBenchmarkSchema,
  CreateCoursePricingSchema,
} from "../Schema/course.schema.ts";

const router = express.Router();
const upload = multer();

router.get(
  "/course-published",
  apiLimiter,
  courseController.getAllPublishedController
);

router.get(
  "/:id/course-modules",
  apiLimiter,
  courseController.getCourseModules
);

router.get(
  "/:id/course-assessment",
  apiLimiter,
  isAuthenticated,
  courseController.getCourseAssesments
);

router.post(
  "/:id/course-assessment/submit",
  apiLimiter,
  isAuthenticated,
  courseController.submitCourseAssessment
);

router.post(
  "/:courseId/launch-course",
  apiLimiter,
  isAuthenticated,
  courseController.launchCourse
);

router.get("/:id/course-summary", courseController.getCourseSummary);

router
  .route("/")
  .get(courseController.getAllAdminCourses)
  .post(
    apiLimiter,
    isAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    uploadFile,
    courseController.uploadCourseController
  );

router.post(
  "/assign-courses-to-staff",
  upload.single("file"),
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  courseController.bulkAssigningOfCourses
);

router.post(
  "/upload-course-certificate",
  apiLimiter,
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  uploadCertificate,
  courseController.uploadCourseCertificate
);

router
  .route("/edit-benchmark")
  .put(
    apiLimiter,
    isAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    courseController.editCourseBenchmark
  );

router
  .route("/course-assessment")
  .post(
    apiLimiter,
    isAuthenticated,
    validateRequest(CreateCourseAssessmentSchema),
    checkUserRole(["admin", "superadmin"]),
    courseController.createCourseAssessment
  );

router.post(
  "/course-benchmark",
  apiLimiter,
  isAuthenticated,
  validateRequest(CreateCourseBenchmarkSchema),
  checkUserRole(["admin", "superadmin"]),
  courseController.createCourseBenchmark
);

router
  .route("/course-pricing")
  .post(
    apiLimiter,
    isAuthenticated,
    validateRequest(CreateCoursePricingSchema),
    checkUserRole(["admin", "superadmin"]),
    courseController.createCoursePricing
  )
  .patch(
    apiLimiter,
    isAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    courseController.updateCoursePricing
  );

router
  .route("/:id/publish-course")
  .patch(
    apiLimiter,
    isAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    courseController.publishCourse
  );

router
  .route("/:id")
  .put(
    apiLimiter,
    isAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    courseController.updateCourseController
  );

router
  .route("/course-assessment/:id")
  .put(
    apiLimiter,
    isAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    courseController.updateCourseAssessment
  );

router
  .route("/course-assessments/:id/submit")
  .post(apiLimiter, isAuthenticated, courseController.submitCourseAssessment);

router.route("/:id").get(apiLimiter, courseController.getCourseById);

// bug: fix this code later
// router
//   .route("/")
//   .get((req, res) => {
//     res.send("The code is here");
//   })
//   .post(
//     isAuthenticated,
//     checkUserRole(["admin", "superadmin"]),
//     uploadFile,
//     courseController.uploadCourseController
//   );

router
  .route("/:id")
  .put(
    isAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    courseController.updateCourseController
  );

export default router;
