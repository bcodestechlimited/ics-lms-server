import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { APP_CONFIG } from "../config/app.config";
import { AdminQueryOptions } from "../interfaces/admin.interface";
import CertificateTemplateModel from "../models/certificate-template.model";
import Course from "../models/Course";
import User, { UserRole } from "../models/User";
import UserCourseExtensionRequest, {
  CourseRequestStatus,
} from "../models/user-request.model";
import { ServiceResponse } from "../utils/service-response";
import { emailService } from "./mail.service";
import { ApiError, ApiSuccess } from "../utils/response-handler";
import xlsx from "xlsx";

class AdminService {
  // test : this service
  public async getUsersRequestForCourseExtension({
    options,
    query,
  }: AdminQueryOptions) {
    try {
      const userRequests = await UserCourseExtensionRequest.paginate(
        query,
        options,
      );

      return ServiceResponse.success("Success", userRequests, StatusCodes.OK);
    } catch (error) {
      return ServiceResponse.failure(
        "Internal Server Error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
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
          StatusCodes.NOT_FOUND,
        );
      }

      const user = await User.findById({
        _id: extensionRequest.user,
      });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      const expiredCourseIndex = user.expiredCourses.findIndex(
        (course) =>
          course.course.toString() === extensionRequest.course.toString(),
      );

      if (expiredCourseIndex === -1) {
        return ServiceResponse.failure(
          "Course not found in user's expired courses",
          null,
          StatusCodes.BAD_REQUEST,
        );
      }

      const expiredCourse = user.expiredCourses[expiredCourseIndex];

      const currentExpiry = new Date(expiredCourse.expiresAt);
      const newExpiry = new Date(
        currentExpiry.getTime() + extensionDays * 24 * 60 * 60 * 1000,
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
        { new: true },
      );

      const course = await Course.findByIdAndUpdate(extensionRequest.course, {
        $addToSet: { participants: extensionRequest.user },
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
        StatusCodes.OK,
      );
    } catch (error) {
      return ServiceResponse.failure(
        "Internal Server Error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async handleRejectUserRequestForCourseExtension(
    extensionId: string,
    courseTitle: string,
  ) {
    try {
      const extensionRequest = await UserCourseExtensionRequest.findById({
        _id: new mongoose.Types.ObjectId(extensionId),
      });

      if (!extensionRequest) {
        return ServiceResponse.failure(
          "Extension request not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      const user = await User.findById({
        _id: extensionRequest.user,
      });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      const expiredCourseIndex = user.expiredCourses.findIndex(
        (course) =>
          course.course.toString() === extensionRequest.course.toString(),
      );

      if (expiredCourseIndex === -1) {
        return ServiceResponse.failure(
          "Course not found in user's expired courses",
          null,
          StatusCodes.BAD_REQUEST,
        );
      }

      await UserCourseExtensionRequest.findByIdAndUpdate(
        extensionId,
        {
          status: CourseRequestStatus.REJECTED,
        },
        { new: true },
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
        StatusCodes.OK,
      );
    } catch (error) {
      return ServiceResponse.failure(
        "Internal Server Error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async uploadCertificateTemplate(
    secure_url: string,
    public_id: string,
  ) {
    try {
      const updated = await CertificateTemplateModel.findOneAndUpdate(
        {},
        {
          url: secure_url,
          publicId: public_id,
          updatedAt: new Date(),
        },
        { upsert: true, new: true },
      );

      if (!updated) {
        return ServiceResponse.failure(
          "Failed to update certificate template record",
          null,
          StatusCodes.BAD_REQUEST,
        );
      }

      return ServiceResponse.success(
        "Certificate template uploaded successfully",
        updated,
        StatusCodes.CREATED,
      );
    } catch (error) {
      return ServiceResponse.failure(
        "Failed to upload certificate template",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
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
    const exists = await User.findOne({ email });
    if (exists) {
      return ServiceResponse.failure(
        "Email already in use",
        null,
        StatusCodes.BAD_REQUEST,
      );
    }

    const salt = await bcrypt.genSalt(12);
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
      isActive: true,
    });

    await admin.save();

    return ServiceResponse.success(
      "Admin account created",
      admin,
      StatusCodes.CREATED,
    );
  }

  public async verifyEmail(id: string) {
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    user.isEmailVerified = true;
    await user.save();
    return ApiSuccess.ok("Email verified successfully", user);
  }

  public async bulkVerifyEmails(fileBuffer: Buffer, status: boolean) {
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error("No sheets found in uploaded Excel file");
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json<any>(sheet, {
      defval: null,
    });

    let updatedCount = 0;
    let skippedCount = 0;

    for (const row of data) {
      const emailValue = row.email || row.Email || row.EMAIL;

      if (!emailValue) {
        skippedCount++;
        continue;
      }

      const email = emailValue.toString().toLowerCase().trim();

      const result = await User.updateOne(
        { email },
        { $set: { isEmailVerified: status } },
      );

      if (result.matchedCount && result.matchedCount > 0) {
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    return ApiSuccess.ok("Bulk email verification processed", {
      total: data.length,
      updated: updatedCount,
      skipped: skippedCount,
    });
  }
}

export const adminService = new AdminService();
export default AdminService;
