import dayjs from "dayjs";
import {StatusCodes} from "http-status-codes";
import mongoose from "mongoose";
import {APP_CONFIG} from "../config/app.config";
import {AdminQueryOptions} from "../interfaces/admin.interface";
import Course from "../models/Course";
import User from "../models/User";
import UserCourseExtensionRequest, {
  CourseRequestStatus,
} from "../models/user-request.model";
import {
  ServiceResponse,
  ServiceResponseSchema,
} from "../utils/service-response";
import {emailService} from "./mail.service";
import {UploadedFile} from "express-fileupload";
import path from "path";
import fs from "fs";
import SignatureModel from "../models/certificate-template.model";

class AdminService {
  // test : this service
  public async getUsersRequestForCourseExtension({
    options,
    query,
  }: AdminQueryOptions) {
    try {
      const userRequests = await UserCourseExtensionRequest.paginate(
        query,
        options
      );

      return ServiceResponse.success("Success", userRequests, StatusCodes.OK);
    } catch (error) {
      return ServiceResponse.failure(
        "Internal Server Error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // test: api to toggle reponse to user request
  public async handleAcceptUserRequestForCourseExtension({
    extensionId,
    extensionDays,
  }: {
    extensionId: string | mongoose.Types.ObjectId;
    extensionDays: number;
  }) {
    try {
      const extensionRequest = await UserCourseExtensionRequest.findById({
        _id: new mongoose.Types.ObjectId(extensionId),
      });
      if (!extensionRequest) {
        return ServiceResponse.failure(
          "Extension request not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      const user = await User.findById({
        _id: extensionRequest.user,
      });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      const expiredCourseIndex = user.expiredCourses.findIndex(
        (course) =>
          course.course.toString() === extensionRequest.course.toString()
      );

      if (expiredCourseIndex === -1) {
        return ServiceResponse.failure(
          "Course not found in user's expired courses",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      const expiredCourse = user.expiredCourses[expiredCourseIndex];

      const currentExpiry = new Date(expiredCourse.expiresAt);
      const newExpiry = new Date(
        currentExpiry.getTime() + extensionDays * 24 * 60 * 60 * 1000
      );
      const newEnrollment = {
        course: new mongoose.Types.ObjectId(extensionRequest.course),
        expiresAt: newExpiry,
      };

      user.expiredCourses.splice(expiredCourseIndex, 1);
      user.courseEnrollments.push(newEnrollment);

      await user.save();
      await UserCourseExtensionRequest.findByIdAndUpdate(
        extensionId,
        {
          status: CourseRequestStatus.APPROVED,
        },
        {new: true}
      );

      const course = await Course.findByIdAndUpdate(extensionRequest.course, {
        $addToSet: {participants: extensionRequest.user},
      });

      // idea: send email
      await emailService.sendEmailTemplate({
        subject: "Course Extension Request Accepted",
        template: "",
        to: user.email,
        variables: {
          firstName: user.firstName,
          extensionDays,
          courseName: course!.title,
          supportEmail: APP_CONFIG.SUPPORT_EMAIL,
          expirationData: dayjs(newExpiry).format("DD-MM-YYYY"),
        },
      });

      return ServiceResponse.success(
        "Course access extended successfully",
        {
          newExpirationDate: newExpiry,
          courseId: extensionRequest.course,
          userId: extensionRequest.user,
        },
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

  public async handleRejectUserRequestForCourseExtension(
    extensionId: string,
    courseTitle: string
  ) {
    try {
      const extensionRequest = await UserCourseExtensionRequest.findById({
        _id: new mongoose.Types.ObjectId(extensionId),
      });

      if (!extensionRequest) {
        return ServiceResponse.failure(
          "Extension request not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      const user = await User.findById({
        _id: extensionRequest.user,
      });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      const expiredCourseIndex = user.expiredCourses.findIndex(
        (course) =>
          course.course.toString() === extensionRequest.course.toString()
      );

      if (expiredCourseIndex === -1) {
        return ServiceResponse.failure(
          "Course not found in user's expired courses",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      await UserCourseExtensionRequest.findByIdAndUpdate(
        extensionId,
        {
          status: CourseRequestStatus.REJECTED,
        },
        {new: true}
      );

      await emailService.sendEmailTemplate({
        subject: "Course Extension Request Rejected",
        template: "extension-declined",
        to: user.email,
        variables: {
          firstName: user.firstName,
          courseName: courseTitle,
          supportEmail: APP_CONFIG.SUPPORT_EMAIL,
        },
      });

      return ServiceResponse.success(
        "Request rejected successfully",
        null,
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

  public async uploadCertificateTemplate(payload: UploadedFile) {
    try {
      const uploadDir = path.resolve(__dirname, "../../uploads/signature");
      fs.mkdirSync(uploadDir, {recursive: true});

      const filename = `${Date.now()}_${payload.name}`;
      const filePath = path.join(uploadDir, filename);
      await payload.mv(filePath);

      const updated = await SignatureModel.findOneAndUpdate(
        {},
        {path: filePath, originalName: payload.name, updatedAt: new Date()},
        {upsert: true, new: true}
      );

      if (!updated) {
        return ServiceResponse.failure(
          "Bad Request",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      return ServiceResponse.success(
        "Signature uploaded successfully",
        updated,
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
}

export const adminService = new AdminService();
export default AdminService;
