import {Request, Response} from "express";
import fs from "fs";
import {StatusCodes} from "http-status-codes";
import {ExtendedRequest} from "../interfaces/auth.interface";
import {handleServiceResponse} from "../Middlewares/validation.middleware";
import {certificateService} from "../Services/certificate.service";
import {emailService} from "../Services/mail.service";
import {cleanupFile} from "../utils/lib";
import {ServiceResponse} from "../utils/service-response";

class CertificateController {
  async generateCertificate(req: Request, res: Response) {
    let pdfPath: string | null = null;
    try {
      const {firstName, lastName, courseTitle, email} = req.body;
      const generateCertificate = await certificateService.generateCertificate(
        {lastName, firstName},
        courseTitle
      );
      pdfPath = generateCertificate.data.pdfPath;
      // console.log("[Controller] Received path:", pdfPath);
      // if (!pdfPath) {
      //   throw new Error("No PDF path returned from service");
      // }

      // if (!fs.existsSync(pdfPath)) {
      //   throw new Error("PDF not found at path: " + pdfPath);
      // }
      // const pdfBuffer = fs.readFileSync(pdfPath);
      // email the owner thier certificate
      const emailResponse = await emailService.sendEmailTemplate({
        subject: "Certificate of Completion",
        template: "certificate-completion",
        to: email,
        variables: {
          pdfLink: generateCertificate.data.cloudinaryUrl,
          firstName: firstName,
          fullName: firstName + " " + lastName,
        },
        // attachments: [
        //   {
        //     filename: generateCertificate.data.pdfFileName,
        //     content: pdfBuffer,
        //     contentType: "application/pdf",
        //   },
        // ],
      });

      if (emailResponse.status !== "ok") {
        return handleServiceResponse(
          ServiceResponse.failure(
            "Error sending email",
            null,
            StatusCodes.BAD_REQUEST
          ),
          res
        );
      }

      if (pdfPath) cleanupFile(generateCertificate.data.pdfPath);
      console.log("[Controller] Reading PDF from:", pdfPath);
      console.log("[Controller] File exists?", fs.existsSync(pdfPath));
      handleServiceResponse(
        ServiceResponse.success(
          "Success",
          {message: "Email sent with attachment"},
          200
        ),
        res
      );
    } catch (error) {
      console.log("error", error);
      if (pdfPath) cleanupFile(pdfPath);
      handleServiceResponse(
        ServiceResponse.failure(
          "Internal Server Error",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        ),
        res
      );
    }
  }

  async getCertificateById(req: Request, res: Response) {
    try {
      const {id} = req.params;
      const response = await certificateService.fetchCertificateById(id);
      if (!response.success) {
        return handleServiceResponse(
          ServiceResponse.failure(
            response.message === "No certificate found"
              ? response.message
              : "Bad Request",
            null,
            StatusCodes.BAD_REQUEST
          ),
          res
        );
      }
    } catch (error) {
      handleServiceResponse(
        ServiceResponse.failure(
          "Internal Server Error",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        ),
        res
      );
    }
  }

  async sendCompletionCertificate(req: ExtendedRequest, res: Response) {
    const userId = req.user?._id;
    const courseId = req.params.courseId;

    const response = await certificateService.issueCertificate(
      userId,
      courseId
    );

    res.status(response.statusCode).json(response);
  }
}

export const certificateController = new CertificateController();
export default CertificateController;
