import { Router } from "express";
import { planController } from "../controllers/plan.controller";
import { apiLimiter } from "../Middlewares/RateLimiter";
import { checkUserRole, isAuthenticated } from "../Middlewares/Auth";
import validateRequest from "../Middlewares/validation.middleware";
import { createPlanSchema, updatePlanSchema } from "../Schema/plan.schema";

const router = Router();

router
  .route("/")
  .get(
    apiLimiter,
    isAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    planController.getPlans
  )
  .post(
    apiLimiter,
    validateRequest(createPlanSchema),
    isAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    planController.createPlan
  );

router
  .route("/:id")
  .put(
    apiLimiter,
    validateRequest(updatePlanSchema),
    isAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    planController.editPlan
  )
  .delete(
    apiLimiter,
    isAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    planController.deletePlan
  );


export default router;
