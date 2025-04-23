import fs from "fs";
import path from "path";
import {PDFDocument, rgb, StandardFonts} from "pdf-lib";
import puppeteer from "puppeteer";
import {v4 as uuidv4} from "uuid";
import certificateTemplateModel from "../models/certificate-template.model";
import CourseCertificateModel from "../models/certificate.model";
import {uploadToCloudinary} from "../utils/cloudinary.utils";
import User from "../models/User";
import Course from "../models/Course";
import {ServiceResponse} from "../utils/service-response";
import {StatusCodes} from "http-status-codes";

class CertificateService {
  // TODO: CODE TO ISSUE CERTIFICATE
  public async issueCertificate(
    userId: string,
    courseId: string,
    session?: any
  ) {
    //idea: mark completion in db here, from here I can say that the user has completed the course

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return ServiceResponse.failure(
        "User or course not found",
        null,
        StatusCodes.NOT_FOUND
      );
    }
    const issueDate = new Date().toLocaleDateString("en-GB");
    const userName = user.firstName + user.lastName;
    const pdfBuffer = await this.generateStudentCertificate(
      userName,
      course.title,
      issueDate
    );

    // send email to the user

    return ServiceResponse.success(
      "Certificate issued successfully",
      {data: pdfBuffer},
      StatusCodes.OK
    );
  }

  public async generateStudentCertificate(
    studentName: string,
    courseTitle: string,
    issueDate: string
  ) {
    const templatePath = await this.getTemplatePath();
    const templateBytes = fs.readFileSync(templatePath);

    const arrayBuffer = templateBytes.buffer.slice(
      templateBytes.byteOffset,
      templateBytes.byteOffset + templateBytes.byteLength
    );
    const pdfDoc = await PDFDocument.load(arrayBuffer as any);

    // 2. Fill in the name, title, date
    const page = pdfDoc.getPage(0);
    const {width, height} = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText(studentName, {
      x: 180,
      y: height - 180,
      size: 26,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(courseTitle, {
      x: 160,
      y: height - 240,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(issueDate, {
      x: 240,
      y: height - 300,
      size: 16,
      font,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private async getTemplatePath() {
    const doc = await certificateTemplateModel.findOne();
    if (!doc) throw new Error("No certificate template found");
    return doc.path;
  }

  // NOTE: REMOVE THIS CODE
  async generateCertificate(
    {firstName, lastName}: {firstName: string; lastName: string},
    courseTitle: string
  ) {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    const userName = firstName + lastName;
    const safeUserName = userName.replace(/[^a-zA-Z0-9]/gi, "-").toLowerCase();
    const safeCourseTitle = courseTitle
      .replace(/[^a-zA-Z0-9]/gi, "-")
      .toLowerCase();

    const certificateHtml = `
      <html>
      <head>
        <style>
          body { text-align: center; font-family: Arial, sans-serif; }
          .certificate { border: 5px solid #333; padding: 20px; width: 80%; margin: auto; }
          h1 { color: #0073e6; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>Certificate of Completion</h1>
          <p>This is to certify that <strong>${userName}</strong> has successfully completed the course <strong>${courseTitle}</strong>.</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
    </html>
      `;

    await page.setContent(certificateHtml);
    const uniqueId = uuidv4();

    // const tempDir = path.join(__dirname, "../temp");
    const tempDir = path.join(process.cwd(), "temp");
    const pdfFileName = `${safeUserName}-${safeCourseTitle}-${uniqueId}.pdf`;
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, {recursive: true});
    }
    const pdfPath = path.join(__dirname, "../temp", pdfFileName);
    // const pdfPath = path.join(
    //   __dirname,
    //   "certificates/${userName}-${courseTitle}.pdf"
    // );

    console.log("[service] PDF saved to: ", pdfPath);
    console.log(
      "[Service] Directory exists?",
      fs.existsSync(path.dirname(pdfPath))
    );

    await page.pdf({
      path: pdfPath,
      format: "ledger",
      printBackground: true,
      margin: {top: "20px", bottom: "20px", left: "20px", right: "20px"},
      scale: 1.5,
      preferCSSPageSize: true,
    });
    await browser.close();

    if (!fs.existsSync(pdfPath)) {
      throw new Error("PDF file was not created!");
    }

    const cloudinary_response = await uploadToCloudinary(pdfPath, {
      folderName: "certificates",
      resourceType: "raw",
    });
    // fs.unlinkSync(pdfPath);
    const certificate = new CourseCertificateModel({
      userName: userName,
      courseTitle: courseTitle,
      cloudinaryUrl: cloudinary_response,
      // cloudinaryId: cloudinary_response.public_id,
    });

    await certificate.save();
    return {
      success: true,
      message: "Certificate successfully created",
      data: {
        cloudinaryUrl: cloudinary_response,
        certificate,
        pdfPath,
        pdfFileName,
      },
    };
  }

  async fetchCertificateById(id: string) {
    const certificate = await CourseCertificateModel.findById({_id: id});
    if (!certificate) {
      return {
        success: false,
        message: "No certificate found",
      };
    }
    return {
      success: true,
      message: "Certificate successfully fetched",
      data: {
        certificate,
      },
    };
  }
}

export const certificateService = new CertificateService();
export default CertificateService;
