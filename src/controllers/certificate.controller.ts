import {Request, Response} from "express";
import {certificateService} from "../Services/certificate.service";

class CertificateController {
  public async testIssueCertificate(req: Request, res: Response) {
    const serviceResponse = await certificateService.testIssueCertificate();

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }
}

export const certificateController = new CertificateController();
export default CertificateController;
