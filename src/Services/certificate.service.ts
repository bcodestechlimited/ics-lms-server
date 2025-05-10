import fs from "fs/promises";
import {StatusCodes} from "http-status-codes";
import path from "path";
import {PDFDocument} from "pdf-lib";
import {CertificateQueryOptions} from "../interfaces/certificate.interface";
import CertificateTemplate from "../models/certificate-template.model";
import Certificate from "../models/certificate.model";
import Course from "../models/Course";
import CourseCompletion from "../models/course-completion.model";
import User from "../models/User";
import {ServiceResponse} from "../utils/service-response";
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
      console.log("from the service", {emailResponse});

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
     
      return ServiceResponse.success(
        "Certificate issued successfully",
        null,
        StatusCodes.OK
      );
    } catch (error) {
    
      return ServiceResponse.failure(
        "Failed to issue certificate",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

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
   
      throw new Error("Failed to retrieve certificate template");
    }
  }

  public async fetchStudentsWithIssuedCertificate({
    options,
    query,
  }: CertificateQueryOptions) {
    try {
      const certificates = await Certificate.paginate(query, {
        page: options.page,
        limit: options.limit,
        sort: options.sort,
        populate: [
          {path: "userId", select: "firstName lastName email"},
          {path: "courseId", select: "title"},
        ],
        lean: true,
      });

      const meta = {
        total: certificates.totalDocs,
        limit: certificates.limit,
        page: certificates.page,
        pages: certificates.totalPages,
        hasNextPage: certificates.hasNextPage,
        hasPrevPage: certificates.hasPrevPage,
        nextPage: certificates.nextPage,
        prevPage: certificates.prevPage,
      };

      return ServiceResponse.success(
        "Fetched all student with issued certificate",
        {data: certificates.docs, meta},
        StatusCodes.OK
      );
    } catch (error) {
      return ServiceResponse.failure(
        "An error occurred while fetching certificate",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async fetchCertificatesByUserId({
    userId,
    options,
  }: {
    userId: string;
    options: {
      page: number;
      limit: number;
      sort?: any;
    };
  }) {
    const query = {userId};
    const certificates = await Certificate.paginate(query, {
      page: options.page,
      limit: options.limit,
      sort: options.sort || {issuedAt: -1},
      populate: {
        path: "courseId",
        select: "title image",
      },
      lean: true,
    });

    return {
      data: certificates.docs.map((certificate) => ({
        _id: certificate._id,
        course_title: certificate.courseId?.title as unknown as string,
        course_image: certificate.courseId?.image as unknown as string,
        issuedAt: certificate.issuedAt,
      })),
      meta: {
        total: certificates.totalDocs,
        limit: certificates.limit,
        page: certificates.page,
        pages: certificates.totalPages,
        hasNextPage: certificates.hasNextPage,
        hasPrevPage: certificates.hasPrevPage,
        nextPage: certificates.nextPage,
        prevPage: certificates.prevPage,
      },
    };
  }
}

export const certificateService = new CertificateService();
export default CertificateService;
