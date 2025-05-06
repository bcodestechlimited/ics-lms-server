import {Request, Response} from "express";
import fileUpload from "express-fileupload";
import {adminService} from "../Services/admin.service";

class AdminController {
  // test: api to approve user request
  public async handleAcceptUserRequestForCourseExtension(
    req: Request,
    res: Response
  ) {
    const {extensionDays, extensionId} = req.body;
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
    res: Response
  ) {
    const {extensionId, courseTitle} = req.body;
    const serviceResponse =
      await adminService.handleRejectUserRequestForCourseExtension(
        extensionId,
        courseTitle
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
      query.$or = [{email: {$regex: search, $options: "i"}}];
    }
    Object.assign(query, filters);
    const projection = fields ? (fields as string).split(",").join(" ") : "";
    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort: {[sort as string]: order === "asc" ? 1 : -1},
      populate: [
        {path: "user", select: "firstName lastName email"},
        {path: "course", select: "title"},
      ],
      select: projection,
    };

    const serviceResponse =
      await adminService.getUsersRequestForCourseExtension({options, query});

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  public async uploadCertificateTemplate(req: Request, res: Response) {
    const files = req.files as fileUpload.FileArray | undefined;
    if (!files?.certificate_template) {
      return res.status(400).json({error: "No file uploaded"});
    }
    const certificateFile = Array.isArray(files.certificate_template)
      ? files.certificate_template[0]
      : files.certificate_template;

    const response = await adminService.uploadCertificateTemplate(
      certificateFile
    );

    res.status(response.statusCode).json(response);
  }

  public async createAdminAccount(req: Request, res: Response) {
    const {firstName, lastName, email, password} = req.body;
    const serviceResponse = await adminService.createAdmin({
      firstName,
      lastName,
      email,
      password,
    });

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }
}

export const adminController = new AdminController();
export default AdminController;
