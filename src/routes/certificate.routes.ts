import express from "express";
import {certificateController} from "../controllers/certificate.controller";
import {checkUserRole, isLocalAuthenticated} from "../Middlewares/Auth";
import {apiLimiter} from "../Middlewares/RateLimiter";

const router = express.Router();

router.get(
  "/",
  apiLimiter,
  isLocalAuthenticated,
  checkUserRole(["admin", "superadmin"]),
  certificateController.getStudentsWithIssuedCertificate
);

export default router;
