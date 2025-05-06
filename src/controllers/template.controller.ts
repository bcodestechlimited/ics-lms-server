import {Request, Response} from "express";
import {StatusCodes} from "http-status-codes";
import {ExtendedRequest} from "../interfaces/auth.interface";
import {handleServiceResponse} from "../Middlewares/validation.middleware";
import {templateService} from "../Services/template.service";
import {ServiceResponse} from "../utils/service-response";

class TemplateController {
  async createTemplateFromCourse(req: Request, res: Response) {
    try {
      const {courseId} = req.params;
      const response = await templateService.createTemplateFromCourse(courseId);

      if (!response?.success) {
        return handleServiceResponse(
          ServiceResponse.failure(
            response?.message || "Failed to create template from course",
            null,
            response?.message === "No course found"
              ? StatusCodes.NOT_FOUND
              : StatusCodes.BAD_REQUEST
          ),
          res
        );
      }

      handleServiceResponse(
        ServiceResponse.success("Success", response, StatusCodes.CREATED),
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

  async createCourseFromTemplate(req: ExtendedRequest, res: Response) {
    try {
      const {templateId} = req.params;
      const response = await templateService.createCourseFromTemplate(
        templateId,
        req.user?._id
      );

      if (!response.success) {
        return handleServiceResponse(
          ServiceResponse.failure(
            "Failed to create course from template",
            null,
            StatusCodes.BAD_REQUEST
          ),
          res
        );
      }

      handleServiceResponse(
        ServiceResponse.success("Success", response, StatusCodes.CREATED),
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

  async getAllTemplates(req: Request, res: Response) {
    try {
      const response = await templateService.fetchAllTemplates();

      if (!response?.success) {
        return handleServiceResponse(
          ServiceResponse.failure(
            "Failed to fetch templates",
            null,
            StatusCodes.BAD_REQUEST
          ),
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

  async getTemplateById(req: Request, res: Response) {
    try {
      const {id} = req.params;
      const response = await templateService.fetchTemplateById(id);
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
}

export const templateController = new TemplateController();
export default TemplateController;
