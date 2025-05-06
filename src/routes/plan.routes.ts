import {Router} from "express";
import {planController} from "../controllers/plan.controller";
import {checkUserRole, isLocalAuthenticated} from "../Middlewares/Auth";
import {apiLimiter} from "../Middlewares/RateLimiter";
import validateRequest from "../Middlewares/validation.middleware";
import {createPlanSchema, updatePlanSchema} from "../Schema/plan.schema";

const router = Router();

router
  .route("/")
  .get(
    apiLimiter,
    isLocalAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    planController.getPlans
  )
  .post(
    apiLimiter,
    validateRequest(createPlanSchema),
    isLocalAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    planController.createPlan
  );

router
  .route("/:id")
  .put(
    apiLimiter,
    validateRequest(updatePlanSchema),
    isLocalAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    planController.editPlan
  )
  .delete(
    apiLimiter,
    isLocalAuthenticated,
    checkUserRole(["admin", "superadmin"]),
    planController.deletePlan
  );

export default router;
