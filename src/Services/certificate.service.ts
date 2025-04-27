import fs from "fs/promises";
import {StatusCodes} from "http-status-codes";
import path from "path";
import {PDFDocument, rgb, StandardFonts} from "pdf-lib";
import puppeteer from "puppeteer";
import {v4 as uuidv4} from "uuid";
import CertificateTemplate from "../models/certificate-template.model";
import CourseCertificateModel from "../models/certificate.model";
import Course from "../models/Course";
import User from "../models/User";
import {uploadToCloudinary} from "../utils/cloudinary.utils";
import {ServiceResponse} from "../utils/service-response";
import CourseCompletion from "../models/course-completion.model";
import Certificate from "../models/certificate.model";
import {emailService} from "./mail.service";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const CERT_FOLDER = "certificates";

class CertificateService {
  // TODO: CODE TO ISSUE CERTIFICATE
  public async issueCertificate(userId: string, courseId: string) {
    try {
      const [user, course] = await Promise.all([
        User.findById(userId),
        Course.findById(courseId),
      ]);
      if (!user || !course) {
        return ServiceResponse.failure(
          "User or course not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      if (!user || !course) {
        return ServiceResponse.failure(
          "User or course not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      const existingCompletion = await CourseCompletion.findOne({
        userId: userId,
        courseId: courseId,
      });

      if (!existingCompletion) {
        await CourseCompletion.create({
          userId: userId,
          courseId: courseId,
          completedAt: new Date(),
        });
      }

      const issueDate = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date());
      const fullName = `${user.firstName}  ${user.lastName}`;

      //  Generate certificate
      const pdfBuffer: Buffer = await this.generatePDF(
        fullName,
        course.title,
        issueDate
      );

      const certDir = path.join(UPLOAD_ROOT, CERT_FOLDER);
      await fs.mkdir(certDir, {recursive: true});

      const fileName = `cert-${userId}-${courseId}-${Date.now()}.pdf`;
      const savePath = path.join(certDir, fileName);

      const uint8 = new Uint8Array(
        pdfBuffer.buffer,
        pdfBuffer.byteOffset,
        pdfBuffer.byteLength
      );
      await fs.writeFile(savePath, uint8);

      // Save certificate record to database
      const certificate = await Certificate.create({
        userId,
        courseId,
        fileName,
        path: path.join(CERT_FOLDER, fileName),
        issuedAt: new Date(),
      });
      // send email to the user
      const emailPayload = {
        subject: `Certificate of Completion - ${course.title}`,
        template: "certificate",
        to: user.email,
        variables: {
          userName: fullName,
          courseTitle: course.title,
          issueDate: issueDate,
          courseId: courseId,
          certificateId: certificate._id,
        },
        attachments: [
          {
            filename: `${course.title.replace(/\s+/g, "_")}_Certificate.pdf`,
            content: pdfBuffer.toString("base64"),
            encoding: "base64",
          },
        ],
      };
      const emailResponse = await emailService.sendEmailTemplate(emailPayload);
      console.log({emailResponse});

      return ServiceResponse.success(
        "Certificate issued successfully",
        {data: pdfBuffer},
        StatusCodes.OK
      );
    } catch (error) {
      console.log("error", error);
      return ServiceResponse.failure(
        "Failed to issue certificate",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // note: special admin service to test the certificate
  public async testIssueCertificate() {
    try {
      const fullName = "David Bodunrin";
      const courseTitle = "Software Engineering Fundamentals";
      const issueDate = "2025-07-12";
      const userId = "67f521acda633b5ce433684e";
      const courseId = "67cee1842f8c56d684bc5469";
      const userEmail = "bodunrindavidbond@gmail.com";

      const pdfBuffer: Buffer = await this.generatePDF(
        fullName,
        courseTitle,
        issueDate
      );

      const certDir = path.join(UPLOAD_ROOT, CERT_FOLDER);
      await fs.mkdir(certDir, {recursive: true});

      const fileName = `cert-${userId}-${courseId}-${Date.now()}.pdf`;
      const savePath = path.join(certDir, fileName);

      const uint8 = new Uint8Array(
        pdfBuffer.buffer,
        pdfBuffer.byteOffset,
        pdfBuffer.byteLength
      );
      await fs.writeFile(savePath, uint8);

      // Save certificate record to database
      const certificate = await Certificate.create({
        userId,
        courseId,
        fileName,
        path: path.join(CERT_FOLDER, fileName),
        issuedAt: new Date(),
      });
      // send email to the user
      const emailPayload = {
        subject: `Certificate of Completion - ${courseTitle}`,
        template: "certificate",
        to: userEmail,
        variables: {
          userName: fullName,
          courseTitle: courseTitle,
          issueDate: issueDate,
          courseId: courseId,
          certificateId: certificate._id,
        },
        attachments: [
          {
            filename: `${courseTitle.replace(/\s+/g, "_")}_Certificate.pdf`,
            content: pdfBuffer.toString("base64"),
            encoding: "base64",
          },
        ],
      };
      const emailResponse = await emailService.sendEmailTemplate(emailPayload);
      console.log({emailResponse});
      return ServiceResponse.success(
        "Certificate issued successfully",
        null,
        StatusCodes.OK
      );
    } catch (error) {
      console.log("error", error);
      return ServiceResponse.failure(
        "Failed to issue certificate",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /** 
   *   public async generatePDF(
    studentName: string,
    courseTitle: string,
    issueDate: string
  ) {
    try {
      const templatePath = await this.getTemplatePath();

   
      let templateBytes;
      try {
        templateBytes = await fs.readFile(templatePath);
      } catch (error) {
        console.error("Error reading certificate template:", error);
        throw new Error("Failed to read certificate template");
      }

     
      const uint8Array = new Uint8Array(templateBytes);

    
      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(uint8Array);
      } catch (error) {
        console.error("Error loading PDF document:", error);
        throw new Error("Failed to load certificate template as PDF");
      }

     
      const page = pdfDoc.getPages()[0];
      const {width, height} = page.getSize();

  
      let font;
      try {
        font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      } catch (error) {
        console.error("Error embedding font:", error);
        throw new Error("Failed to embed font in certificate");
      }

    
      const nameWidth = font.widthOfTextAtSize(studentName, 26);
      const courseWidth = font.widthOfTextAtSize(courseTitle, 20);
      const dateWidth = font.widthOfTextAtSize(issueDate, 16);

   
      page.drawText(studentName, {
        x: (width - nameWidth) / 2,
        y: height - 180,
        size: 26,
        font,
        color: rgb(0, 0, 0),
      });

      page.drawText(courseTitle, {
        x: (width - courseWidth) / 2,
        y: height - 240,
        size: 20,
        font,
        color: rgb(0, 0, 0),
      });

      page.drawText(issueDate, {
        x: (width - dateWidth) / 2,
        y: height - 300,
        size: 16,
        font,
        color: rgb(0, 0, 0),
      });

     
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error("Certificate generation error:", error);
      throw new Error("Failed to generate certificate");
    }
  }
  */

  public async generatePDF(
    studentName: string,
    courseTitle: string,
    issueDate: string
  ): Promise<Buffer> {
    // 1. Load the form-enabled template
    const templatePath = await this.getTemplatePath();
    const templateBytes = await fs.readFile(templatePath);
    const uint8Array = new Uint8Array(templateBytes);
    const pdfDoc = await PDFDocument.load(uint8Array);

    // 2. Grab the AcroForm
    const form = pdfDoc.getForm();

    // 3. Fill each field by name
    form.getTextField("studentName").setText(studentName);
    form.getTextField("courseTitle").setText(courseTitle);
    form.getTextField("issueDate").setText(issueDate);

    // 4. Flatten form so the fields become static text
    form.flatten();

    // 5. Save and return as a Buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private async getTemplatePath() {
    try {
      const doc = await CertificateTemplate.findOne();
      if (!doc) {
        throw new Error("No certificate template found");
      }

      // Verify the file exists
      try {
        await fs.access(doc.path, fs.constants.R_OK);
      } catch {
        throw new Error(
          `Certificate template file not found or unreadable at path: ${doc.path}`
        );
      }
      return doc.path;
    } catch (error) {
      console.error("Error fetching certificate template:", error);
      throw new Error("Failed to retrieve certificate template");
    }
  }
}

export const certificateService = new CertificateService();
export default CertificateService;
