import {Router} from "express";
import multer from "multer";
import {courseModuleController} from "../controllers/course-module.controller";
import {checkUserRole, isAuthenticated} from "../Middlewares/Auth";
import {apiLimiter} from "../Middlewares/RateLimiter";

const router = Router();

const upload = multer({
  dest: "uploads/",
  limits: {fieldSize: 100 * 1024 * 1024},
  fileFilter(req, file, cb) {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid File type!"));
    }
  },
});

router.post(
  "/:moduleId/complete",
  apiLimiter,
  isAuthenticated,
  courseModuleController.markModuleCompleted
);

/**
 * TODO: in this code make sure that it is the person that created the course that can create module
 */
router
  .route("/")
  .post(
    isAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    apiLimiter,
    upload.any(),
    courseModuleController.create
  );

router
  .route("/:id")
  .put(
    isAuthenticated,
    apiLimiter,
    checkUserRole(["admin", "superadmin"]),
    upload.any(),
    courseModuleController.update
  )
  .get(isAuthenticated, apiLimiter, courseModuleController.getCourseModuleById);

export default router;
