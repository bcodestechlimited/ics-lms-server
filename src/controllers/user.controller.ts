import {Request, Response} from "express";
import {StatusCodes} from "http-status-codes";
import {handleServiceResponse} from "../Middlewares/validation.middleware";
import UserService from "../Services/user.service";
import UserDto from "../dtos/user.dto";
import {ExtendedRequest} from "../interfaces/auth.interface";
import {isMongooseIdValid} from "../utils/lib";
import {ServiceResponse} from "../utils/service-response";

const userService = new UserService();
class UserController {
  constructor() {}
  async getMe(req: ExtendedRequest, res: Response) {
    try {
      if (!req.user) {
        return handleServiceResponse(
          ServiceResponse.failure(
            "User not found",
            null,
            StatusCodes.NOT_FOUND
          ),
          res
        );
      }
      const response = await userService.getMe(req.user._id);
      if (!response.success) {
        return handleServiceResponse(
          ServiceResponse.failure(
            "User not found",
            null,
            StatusCodes.NOT_FOUND
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

  async getAllUsers(req: Request, res: Response) {
    try {
      const response = await userService.fetchAllStudents();

      handleServiceResponse(
        ServiceResponse.success(
          "Success",
          {data: response, length: response.length},
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

  async getAllUsersIssuedCertificates(req: Request, res: Response) {
    try {
      const response = await userService.fetchAllUsersIssuedCertificates();
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

  async getAUserById(req: Request, res: Response) {
    try {
      const {id} = req.params;
      const response = await userService.fetchUserById(id);
      if (!response.success) {
        return handleServiceResponse(
          ServiceResponse.failure(
            "User not found",
            null,
            StatusCodes.NOT_FOUND
          ),
          res
        );
      }
      const UserObj = new UserDto(response.data);

      handleServiceResponse(
        ServiceResponse.success(
          "Success",
          {...response, data: UserObj},
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

  async logout(req: Request, res: Response) {
    try {
      res.clearCookie("accessToken");
      handleServiceResponse(
        ServiceResponse.success("User logged out", null, StatusCodes.OK),
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

  async getUserAnalytics(req: Request, res: Response) {
    const {id} = req.params;

    const response = await userService.fetchCourseAnalytics(id);
    if (!response.success) {
      return handleServiceResponse(
        ServiceResponse.failure("Bad Request", null, StatusCodes.BAD_REQUEST),
        res
      );
    }

    res.status(response.statusCode).json(response);
  }

  // test: api for user to request for course extension
  public async userCanRequestForCourseExtension(req: Request, res: Response) {
    const {courseId, expiryDate, reason, userId, extensionDays} = req.body;

    const serviceResponse = await userService.userCanRequestForCourseExtension({
      courseId,
      expiryDate,
      extensionDays,
      reason,
      userId,
    });

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  public async getUserExpiredCourses(req: ExtendedRequest, res: Response) {
    const serviceResponse = await userService.getUserExpiredCourses(
      req.user?._id
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  public async getMyEnrolledCourses(req: ExtendedRequest, res: Response) {
    const userId = req.user?._id;
    const response = await userService.fetchMyEnrolledCourses(userId);

    res.status(response.statusCode).json(response);
  }

  public async getMyAssignedCourses(req: ExtendedRequest, res: Response) {
    const userId = req.user?._id;
    const response = await userService.fetchMyAssignedCourses(userId);

    res.status(response.statusCode).json(response);
  }

  public async getMyCertificates(req: ExtendedRequest, res: Response) {
    const {page = 1, limit = 10, sort = "issuedAt"} = req.query;
    const userId = req.user?._id;

    const response = await userService.fetchMyCertificates(userId, {
      page: Number(page),
      limit: Number(limit),
      sort: {[sort as string]: -1},
    });

    res.status(response.statusCode).json(response);
  }
}

export const userController = new UserController();
export default UserController;
