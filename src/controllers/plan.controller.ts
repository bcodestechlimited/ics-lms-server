import { Request, Response } from "express";

import { handleServiceResponse } from "../Middlewares/validation.middleware";
import { ServiceResponse } from "../utils/service-response";
import { StatusCodes } from "http-status-codes";
import PlanService from "../Services/plan.service";

const planService = new PlanService();

class PlanController {
  async getPlans(req: Request, res: Response) {
    try {
      const response = await planService.fetchAllPlans();
      if (!response.success) {
        return handleServiceResponse(
          ServiceResponse.failure("Bad Request", null, StatusCodes.BAD_REQUEST),
          res
        );
      }

      handleServiceResponse(
        ServiceResponse.success("Success", response, StatusCodes.OK),
        res
      );
    } catch (error) {
      handleServiceResponse(
        ServiceResponse.failure(
          "Internal Server Error",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        ),
        res
      );
    }
  }

  async createPlan(req: Request, res: Response) {
    try {
      const { name, description, planType, price, duration, features } =
        req.body;
      const response = await planService.createPlan({
        name,
        description,
        planType,
        price: Number(price),
        duration,
        features,
      });
      if (!response.success) {
        return handleServiceResponse(
          ServiceResponse.failure("Bad Request", null, 400),
          res
        );
      }

      handleServiceResponse(
        ServiceResponse.success(
          "Success",
          { data: response.data },
          StatusCodes.CREATED
        ),
        res
      );
    } catch (error) {
      handleServiceResponse(
        ServiceResponse.failure(
          "Internal Server Error",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        ),
        res
      );
    }
  }

  async editPlan(req: Request, res: Response) {
    try {
      const { name, description, planType, price, duration, features } =
        req.body;
      const response = await planService.updatePlan(req.params.id, {
        name,
        description,
        planType,
        price,
        duration,
        features,
      });
      if (!response.success) {
        return handleServiceResponse(
          ServiceResponse.failure("Bad Request", null, StatusCodes.BAD_REQUEST),
          res
        );
      }

      handleServiceResponse(
        ServiceResponse.success(
          "Success",
          { data: response.data },
          StatusCodes.OK
        ),
        res
      );
    } catch (error) {
      handleServiceResponse(
        ServiceResponse.failure(
          "Internal Server Error",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        ),
        res
      );
    }
  }

  async deletePlan(req: Request, res: Response){
    try {
      const response = await planService.deletePlanById(req.params.id)
      if(!response?.success) {
        return handleServiceResponse(ServiceResponse.failure("Bad Request", null, StatusCodes.BAD_REQUEST), res)
      }

      handleServiceResponse(ServiceResponse.success("Success", {data: response.data}, StatusCodes.OK), res)
    } catch (error) {
       handleServiceResponse(
         ServiceResponse.failure(
           "Internal Server Error",
           null,
           StatusCodes.INTERNAL_SERVER_ERROR
         ),
         res
       );
    }
  }
}

export const planController = new PlanController();
export default PlanController;
