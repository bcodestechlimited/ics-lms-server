import { Request, Response } from "express";
import BCTCourse from "../models/bct-course.model";
import { handleServiceResponse } from "../Middlewares/validation.middleware";
import { ServiceResponse } from "../utils/service-response";
import { StatusCodes } from "http-status-codes";

class BCTCourseController {
  async create(req: Request, res: Response) {
    const { course_title } = req.body;
  }

  async getCourses(req: Request, res: Response) {
    const courses = await BCTCourse.find();


    if (!courses) {
      return handleServiceResponse(
        ServiceResponse.success("Courses", [], StatusCodes.NOT_FOUND),
        res
      );
    }

    handleServiceResponse(
      ServiceResponse.success("Courses", courses, StatusCodes.OK),
      res
    );
  }

  async getCourseById(req: Request, res: Response) {
    const { id } = req.params;

    if(!id){
      return handleServiceResponse(ServiceResponse.failure("Invalid request", null, StatusCodes.BAD_REQUEST), res)
    }

    const course = await BCTCourse.findById(id);
    if (!course) {
      return handleServiceResponse(
        ServiceResponse.failure(
          "Course not found",
          null,
          StatusCodes.NOT_FOUND
        ),
        res
      );
    }

    handleServiceResponse(
      ServiceResponse.success("Course", course, StatusCodes.OK),
      res
    );
  }

  async assignCourse(req: Request, res: Response) {}
}

export const bctCourseController = new BCTCourseController();
export default BCTCourseController;
