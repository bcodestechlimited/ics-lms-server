import express from "express";
import { apiLimiter } from "../Middlewares/RateLimiter";
import { checkUserRole, isAuthenticated } from "../Middlewares/Auth";
import CertificateController from "../controllers/certificate.controller";
import validateRequest from "../Middlewares/validation.middleware";
import { CreateCertificateSchema } from "../Schema/certificate.schema";

const router = express.Router();
const certificateController = new CertificateController();

router.route("/generate-certificate").post(
  apiLimiter,
  validateRequest(CreateCertificateSchema),
  isAuthenticated,
  checkUserRole(["admin", "superadmin"]),

  certificateController.generateCertificate
);

export default router;
