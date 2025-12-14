import { NextFunction, Request, Response } from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import { adminService } from "../Services/admin.service";
import { uploadToCloudinary } from "../utils/cloudinary.utils";
import { ApiError } from "../utils/response-handler";
import fs from "fs";

class AdminController {
  // test: api to approve user request
  public async handleAcceptUserRequestForCourseExtension(
    req: Request,
    res: Response,
  ) {
    const { extensionDays, extensionId } = req.body;
    const serviceResponse =
      await adminService.handleAcceptUserRequestForCourseExtension({
        extensionId,
        extensionDays,
      });

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  // test: api to reject user request
  public async handleRejectUserRequestForCourseExtension(
    req: Request,
    res: Response,
  ) {
    const { extensionId, courseTitle } = req.body;
    const serviceResponse =
      await adminService.handleRejectUserRequestForCourseExtension(
        extensionId,
        courseTitle,
      );

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  // test: api to get all user requests
  public async getUserRequestForCourseExtension(req: Request, res: Response) {
    const {
      page = "1",
      limit = "10",
      sort = "createdAt",
      order = "desc",
      search,
      fields,
      ...filters
    } = req.query;
    const query: Record<string, any> = {};

    if (search) {
      query.$or = [{ email: { $regex: search, $options: "i" } }];
    }
    Object.assign(query, filters);
    const projection = fields ? (fields as string).split(",").join(" ") : "";
    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort: { [sort as string]: order === "asc" ? 1 : -1 },
      populate: [
        { path: "user", select: "firstName lastName email" },
        { path: "course", select: "title" },
      ],
      select: projection,
    };

    const serviceResponse =
      await adminService.getUsersRequestForCourseExtension({ options, query });

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  public async uploadCertificateTemplate(req: Request, res: Response) {
    const files = req.files as fileUpload.FileArray | undefined;
    if (!files?.certificate_template) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const certificateFile = Array.isArray(files.certificate_template)
      ? files.certificate_template[0]
      : files.certificate_template;

    const public_id = `certificate_template_${Date.now()}`;
    const uploadResult = await uploadToCloudinary(
      certificateFile.tempFilePath,
      {
        resourceType: "raw",
        folderName: "LMS/certificate_templates",
        public_id: public_id,
        format: "pdf",
        overwrite: true,
      },
    );

    const response = await adminService.uploadCertificateTemplate(
      uploadResult,
      public_id,
    );

    res.status(response.statusCode).json(response);
  }

  public async createAdminAccount(req: Request, res: Response) {
    const { firstName, lastName, email, password } = req.body;
    const serviceResponse = await adminService.createAdmin({
      firstName,
      lastName,
      email,
      password,
    });

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  public async verifyEmail(req: Request, res: Response) {
    const { id } = req.body;
    const serviceResponse = await adminService.verifyEmail(id);

    res.status(serviceResponse.status_code).json(serviceResponse);
  }

  public async bulkVerifyEmails(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.files || !("file" in req.files)) {
        throw ApiError.badRequest("No file uploaded");
      }

      const uploaded = req.files.file as UploadedFile | UploadedFile[];
      const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;

      const status =
        typeof req.body.status === "string"
          ? req.body.status.toLowerCase() === "true"
          : Boolean(req.body.status);

      let fileBuffer: Buffer | undefined;

      if (file.data && file.data.length > 0) {
        fileBuffer = file.data;
      } else if (file.tempFilePath) {
        fileBuffer = fs.readFileSync(file.tempFilePath);
      }

      if (!fileBuffer || fileBuffer.length === 0) {
        throw ApiError.badRequest("Uploaded file is empty");
      }

      const serviceResponse = await adminService.bulkVerifyEmails(
        fileBuffer,
        status,
      );

      res.status(serviceResponse.status_code).json(serviceResponse);
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
export default AdminController;
