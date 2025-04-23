import {StatusCodes} from "http-status-codes";
import mongoose from "mongoose";
import {UserCourseExtensionPayloadInterface} from "../interfaces/user.interface";
import User from "../models/User";
import UserCourseExtensionRequest from "../models/user-request.model";
import {ServiceResponse} from "../utils/service-response";
import {courseService} from "./course.service";

class UserService {
  async getMe(id: string) {
    const user = await User.findById({_id: id});
    if (!user) {
      return {
        success: false,
        message: "No user found",
      };
    }

    return {
      success: true,
      data: user,
    };
  }

  async fetchAllStudents() {
    const students = await User.find({
      role: {$nin: ["admin", "superadmin"]},
      isAdmin: false,
      privilege: {$nin: ["admin", "superadmin"]},
    });

    return students;
  }

  async fetchAllUsersIssuedCertificates() {
    const users = await User.find({certificates: {$exists: true, $ne: []}});

    if (!users) {
      return {
        success: false,
        data: null,
        message: "No users found",
      };
    }
    return {
      success: true,
      data: users,
    };
  }

  async fetchUserById(id: string) {
    const user = await User.findById(id)
      .populate({
        path: "progress",
        populate: {
          path: "course",
          model: "Course",
        },
      })
      .exec();
    if (!user) {
      return {
        success: false,
        message: "No user found",
      };
    }
    return {
      success: true,
      message: "user found",
      data: user,
    };
  }

  async fetchCourseAnalytics(id: string) {
    const stats = await User.aggregate([
      {$match: {_id: new mongoose.Types.ObjectId(id)}},
      {
        $lookup: {
          from: "progresses",
          localField: "progress",
          foreignField: "_id",
          as: "progressData",
        },
      },
      {
        $project: {
          totalCourses: {$size: "$courses"},
          enrolledCourses: {
            $size: {
              $filter: {
                input: "$progressData",
                as: "p",
                cond: {$eq: ["$$p.status", "in-progress"]},
              },
            },
          },
          completedCourses: {
            $size: {
              $filter: {
                input: "$progressData",
                as: "p",
                cond: {$eq: ["$$p.status", "completed"]},
              },
            },
          },
          certifiedCourses: {
            $size: {
              $filter: {
                input: "$progressData",
                as: "p",
                cond: {$eq: ["$$p.certificateIssued", true]},
              },
            },
          },
        },
      },
    ]);

    if (!stats) {
      return {
        success: false,
        message: "No user found",
      };
    }

    return {
      success: true,
      data: stats,
    };
  }

  // test: api
  public async userCanRequestForCourseExtension({
    courseId,
    expiryDate,
    extensionDays,
    reason,
    userId,
  }: UserCourseExtensionPayloadInterface) {
    try {
      const userExtensionRequest = await UserCourseExtensionRequest.create({
        user: userId,
        course: courseId,
        expiredAt: expiryDate,
        reason: reason,
        extensionDays: extensionDays,
      });

      return ServiceResponse.success(
        "User request successful",
        userExtensionRequest,
        StatusCodes.CREATED
      );
    } catch (error) {
      return ServiceResponse.failure(
        "Internal Server Error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // test: api
  public async getUserExpiredCourses(userId: string | mongoose.Types.ObjectId) {
    try {
      const response = await courseService.getUserExpiredCourses(userId);
      return ServiceResponse.success(
        "Successfully fetched user expired courses",
        response,
        StatusCodes.OK
      );
    } catch (error) {
      console.log("error", error);
      return ServiceResponse.failure(
        "Internal Server Error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async fetchUserCourses(userId: string, isAssigned: boolean) {
    const user = await User.findById(userId).populate({
      path: "courseEnrollments",
      match: {isAssigned},
      populate: {
        path: "course",
        model: "Course",
        select: "_id title image courseDuration summary",
      },
    });

    if (!user) return [];

    return user.courseEnrollments
      .filter((enrollment) => enrollment.course)
      .map((enrollment) => enrollment.course);
  }

  public async fetchMyAssignedCourses(userId: string) {
    try {
      const userCourses = await this.fetchUserCourses(userId, true);

      if (!userCourses) {
        return ServiceResponse.failure(
          "Not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success(
        "Success",
        {data: userCourses},
        StatusCodes.OK
      );
    } catch (error) {
      return ServiceResponse.failure(
        "Internal Server Error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async fetchMyEnrolledCourses(userId: string) {
    try {
      const userCourses = await this.fetchUserCourses(userId, false);

      if (!userCourses) {
        return ServiceResponse.failure(
          "Not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success(
        "Success",
        {data: userCourses},
        StatusCodes.OK
      );
    } catch (error) {
      return ServiceResponse.failure(
        "Internal Server Error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const userService = new UserService();
export default UserService;
