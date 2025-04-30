import express from "express";
import {checkUserRole, isAuthenticated} from "../Middlewares/Auth";
import {certificateController} from "../controllers/certificate.controller";
import {apiLimiter} from "../Middlewares/RateLimiter";

const router = express.Router();

router.get(
  "/",
  isAuthenticated,
  apiLimiter,
  checkUserRole(["admin", "superadmin"]),
  certificateController.getStudentsWithIssuedCertificate
);


export default router;
