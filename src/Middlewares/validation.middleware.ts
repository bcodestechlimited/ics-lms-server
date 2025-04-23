import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError, ZodSchema } from "zod";
import { ServiceResponse } from "../utils/service-response";

export const handleServiceResponse = (
  serviceResponse: ServiceResponse<any>,
  response: Response
) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};

const validateRequest =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMessage = `Validation failed: ${err.errors
          .map((e) => {
            // Include the field name and the error message
            return `${e.path.join(".")}: ${e.message}`;
          })
          .join(", ")}`;
        const statusCode = StatusCodes.BAD_REQUEST;
        const serviceResponse = ServiceResponse.failure(
          errorMessage,
          null,
          statusCode
        );
        return handleServiceResponse(serviceResponse, res);
      } else {
        const statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        const serviceResponse = ServiceResponse.failure(
          "An unexpected error occurred",
          null,
          statusCode
        );
        return handleServiceResponse(serviceResponse, res);
      }
    }
  };

export default validateRequest;
