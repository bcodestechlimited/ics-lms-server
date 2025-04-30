import {Request, Response} from "express";
import {certificateService} from "../Services/certificate.service";

class CertificateController {
  public async testIssueCertificate(req: Request, res: Response) {
    const serviceResponse = await certificateService.testIssueCertificate();

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  public async getStudentsWithIssuedCertificate(req: Request, res: Response) {
    const {
      page = 1,
      limit = "10",
      sort = "createdAt",
      order = "desc",
      search,
      ...filters
    } = req.query;

    const query: Record<string, any> = {};
   if (search) {
     query.$or = [
       {"userId.name": {$regex: search, $options: "i"}},
       {"userId.email": {$regex: search, $options: "i"}},
     ];
   }

    Object.assign(query, filters);
    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort: {[sort as string]: order === "asc" ? 1 : -1},
   
    };

    const serviceResponse =
      await certificateService.fetchStudentsWithIssuedCertificate({
        options,
        query,
      });

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }
}

export const certificateController = new CertificateController();
export default CertificateController;
