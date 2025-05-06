import dayjs from "dayjs";
import {UploadedFile} from "express-fileupload";
import fs from "fs";
import {StatusCodes} from "http-status-codes";
import mongoose from "mongoose";
import path from "path";
import {APP_CONFIG} from "../config/app.config";
import {AdminQueryOptions} from "../interfaces/admin.interface";
import CertificateTemplateModel from "../models/certificate-template.model";
import Course from "../models/Course";
import User, {UserRole} from "../models/User";
import UserCourseExtensionRequest, {
  CourseRequestStatus,
} from "../models/user-request.model";
import {ServiceResponse} from "../utils/service-response";
import {emailService} from "./mail.service";
import bcrypt from "bcryptjs";

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
        isAssigned: true,
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
      const uploadDir = path.resolve(__dirname, "../../uploads/certificate");
      fs.mkdirSync(uploadDir, {recursive: true});

      const fileExtension = path.extname(payload.name);
      const filename = `certificate_template_${Date.now()}${fileExtension}`;
      const filePath = path.join(uploadDir, filename);

      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (payload.size > MAX_FILE_SIZE) {
        return ServiceResponse.failure(
          "File size exceeds 5MB limit",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      await payload.mv(filePath);
      const relativePath = path.join("uploads/certificate", filename);

      const updated = await CertificateTemplateModel.findOneAndUpdate(
        {},
        {
          path: relativePath,
          originalName: payload.name,
          fileType: payload.mimetype,
          fileSize: payload.size,
          updatedAt: new Date(),
        },
        {upsert: true, new: true}
      );

      if (!updated) {
        return ServiceResponse.failure(
          "Failed to update certificate template record",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      return ServiceResponse.success(
        "Certificate template uploaded successfully",
        updated,
        StatusCodes.CREATED
      );
    } catch (error) {
      return ServiceResponse.failure(
        "Failed to upload certificate template",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async createAdmin({
    firstName,
    lastName,
    email,
    password,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const exists = await User.findOne({email});
    if (exists) {
      return ServiceResponse.failure(
        "Email already in use",
        null,
        StatusCodes.BAD_REQUEST
      );
    }

    const salt = await bcrypt.genSalt(12)
    const hashed = await bcrypt.hash(password, salt);
    const admin = new User({
      firstName,
      lastName,
      email,
      password: hashed,
      isAdmin: true,
      role: UserRole.ADMIN,
      status: true,
      isEmailVerified: true,
      isActive: true
    });

    await admin.save()

    return ServiceResponse.success("Admin account created", admin, StatusCodes.CREATED)
  }
}

export const adminService = new AdminService();
export default AdminService;
