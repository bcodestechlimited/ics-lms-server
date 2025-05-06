import {StatusCodes} from "http-status-codes";
import mongoose from "mongoose";
import {UserCourseExtensionPayloadInterface} from "../interfaces/user.interface";
import User, {UserRole} from "../models/User";
import UserCourseExtensionRequest from "../models/user-request.model";
import {ServiceResponse} from "../utils/service-response";
import {courseService} from "./course.service";
import {certificateService} from "./certificate.service";
import {analyticsService} from "./analytics.service";
import {uploadToCloudinary} from "../utils/cloudinary.utils";

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

  // todo: handle pagination
  public async fetchAllStudents() {
    const students = await User.find({
      role: {$nin: [UserRole.ADMIN, UserRole.SUPERADMIN]},
      isAdmin: false,
      privilege: {$nin: [UserRole.ADMIN, UserRole.SUPERADMIN]},
    });

    return students;
  }

  // refactor: remove this code
  public async fetchAllUsersIssuedCertificates() {
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

  public async fetchUserById(id: string) {
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

  public async fetchCourseAnalytics(id: string) {
    try {
      const response = await analyticsService.fetchCourseAnalytics(id);
      return ServiceResponse.success(
        "Successfully fetched user analytics",
        response,
        StatusCodes.OK
      );
    } catch (error) {
      return ServiceResponse.failure(
        "Failed to get user analytics",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
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

  public async getUserExpiredCourses(userId: string | mongoose.Types.ObjectId) {
    try {
      const response = await courseService.getUserExpiredCourses(userId);
      return ServiceResponse.success(
        "Successfully fetched user expired courses",
        response,
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

  public async fetchMyCertificates(
    userId: string,
    options: {page: number; limit: number; sort?: any}
  ) {
    try {
      const myCertificates = await certificateService.fetchCertificatesByUserId(
        {userId, options}
      );
      if (!myCertificates || myCertificates.data.length === 0) {
        return ServiceResponse.failure(
          "No certificates found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success(
        "Fetched my certificates",
        myCertificates,
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

  public async updateProfile({
    firstName,
    lastName,
    userId,
    tempFilePath,
  }: {
    firstName: string;
    lastName: string;
    userId: string;
    tempFilePath: string | undefined;
  }) {
    try {
      const updateFields: any = {};
      if (firstName !== undefined) updateFields.firstName = firstName;
      if (lastName !== undefined) updateFields.lastName = lastName;
      if (tempFilePath) {
        const cloudinary_image = await uploadToCloudinary(tempFilePath, {
          folderName: "users",
          resourceType: "image",
        });

        if (!cloudinary_image) {
          return ServiceResponse.failure(
            "Failed to update user profile photo",
            null,
            StatusCodes.BAD_REQUEST
          );
        }

        updateFields.avatar = cloudinary_image;
      }

      const updated = await User.findByIdAndUpdate(userId, updateFields, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success(
        "User profile updated",
        updated,
        StatusCodes.OK
      );
    } catch (error) {
      return ServiceResponse.failure(
        "Error updating user profile",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // note: tie the status here to isEmailVerified -> in the future when the user has not verified their email, the status will be inactive
  public async toggleAccountStatus(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      return ServiceResponse.failure(
        "User not found",
        null,
        StatusCodes.NOT_FOUND
      );
    }

    user.isActive = !user.isActive;
    await user.save();
    return ServiceResponse.success(
      "Account status updated",
      user,
      StatusCodes.OK
    );
  }
}

export const userService = new UserService();
export default UserService;
