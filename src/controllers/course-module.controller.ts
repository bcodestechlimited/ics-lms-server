import {Request, Response} from "express";
import {StatusCodes} from "http-status-codes";
import {ExtendedRequest} from "../interfaces/auth.interface";
import {handleServiceResponse} from "../Middlewares/validation.middleware";
import Course from "../models/Course";
import {CourseModule} from "../models/course-module.model";
import CourseModuleService from "../Services/course-module.service";
import {ServiceResponse} from "../utils/service-response";

const courseModuleService = new CourseModuleService();
export class CourseModuleController {
  public async create(req: Request, res: Response) {
    try {
      const {courseId, title} = req.body;
      const contentSections = JSON.parse(req.body.contentSections);

      const files = Array.isArray(req.files) ? req.files : [];
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          message: "No course found",
          success: false,
        });
      }

      const processedSections = await courseModuleService.processSection(
        contentSections,
        files
      );

      const lastModule = await CourseModule.findOne({courseId})
        .sort({order: -1})
        .limit(1);
      const order = lastModule ? lastModule.order + 1 : 1;
      const payload = {
        courseId,
        title,
        order,
        contentSections: processedSections.content,
      };
      const response = await courseModuleService.createCourse(payload);

      // SAVE THE CREATED MODULE IN THE COURSE MODEL
      const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        {
          $push: {course_modules: response.data._id},
        },
        {new: true}
      );

      // return res.status(201).json({
      //   message: `${title} module created`,
      //   success: true,
      //   data: { response, updatedCourse },
      // });
      handleServiceResponse(
        ServiceResponse.success(
          `${title} module created`,
          {response, updatedCourse},
          StatusCodes.CREATED
        ),
        res
      );
    } catch (error) {
      handleServiceResponse(
        ServiceResponse.failure(
          error instanceof Error
            ? error.message
            : "Failed to create course module",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        ),
        res
      );
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const {id} = req.params;
      const {title, contentSections} = req.body;
      const parsedContentSections = contentSections
        ? JSON.parse(contentSections)
        : [];

      const courseModule = await CourseModule.findById(id);
      if (!courseModule) {
        return handleServiceResponse(
          ServiceResponse.failure("Course module not found", null, 404),
          res
        );
      }

      const files = Array.isArray(req.files) ? req.files : [];
      const processedSections = await courseModuleService.processSection(
        parsedContentSections,
        files
      );

      if (title) {
        courseModule.title = title;
      }

      if (contentSections) {
        // Create a map of processed sections for quick lookup
        const processedSectionsMap = new Map();
        processedSections.content.forEach((section) => {
          processedSectionsMap.set(section.sectionId, section);
        });

        courseModule.contentSections = courseModule.contentSections.map(
          (section) => {
            if (processedSectionsMap.has(section.sectionId)) {
              const processedSection = processedSectionsMap.get(
                section.sectionId
              );
              return {
                ...section,
                content: processedSection.content,
              };
            }
            return section;
          }
        );

        processedSections.content.forEach((section) => {
          if (
            !courseModule.contentSections.some(
              (existingSection) =>
                existingSection.sectionId === section.sectionId
            )
          ) {
            courseModule.contentSections.push(section);
          }
        });
      }

      await courseModule.save();

      handleServiceResponse(
        ServiceResponse.success("Course module updated", courseModule, 200),
        res
      );
    } catch (error) {
      handleServiceResponse(
        ServiceResponse.failure("Failed to update course module", null, 500),
        res
      );
    }
  }

  public async getCourseModuleById(req: Request, res: Response) {
    const {id} = req.params;
    const response = await courseModuleService.fetchModuleById(id);
    res.status(response.statusCode).json(response);
  }

  public async markModuleCompleted(req: ExtendedRequest, res: Response) {
    const moduleId = req.params.moduleId;
    const userId = req.user?._id;

    const response = await courseModuleService.markModuleAsCompleted(
      userId,
      moduleId
    );

    res.status(response.statusCode).json(response);
  }
}

export const courseModuleController = new CourseModuleController();
export default CourseModuleController;
