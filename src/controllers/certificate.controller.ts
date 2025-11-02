import {Request, Response} from "express";
import {certificateService} from "../Services/certificate.service";
import {IQueryParams} from "../shared/query.interface";

class CertificateController {
  public async testIssueCertificate(req: Request, res: Response) {
    const serviceResponse = await certificateService.testIssueCertificate();

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  public async getStudentsWithIssuedCertificate(req: Request, res: Response) {
    const query = req.query as IQueryParams;
    const result = await certificateService.fetchStudentsWithIssuedCertificate(
      query
    );

    res.status(result.status_code).json(result);
  }
}

export const certificateController = new CertificateController();
export default CertificateController;
