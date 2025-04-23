import nodemailer from "nodemailer";
import { APP_CONFIG } from "../config/app.config";

const SendEmail = async (emailContent: any) => {
  const transporter = nodemailer.createTransport({
    host: APP_CONFIG.SMTP_HOST,
    port: Number(APP_CONFIG.SMTP_PORT),
    secure: false,
    auth: {
      user: APP_CONFIG.SMTP_EMAIL,
      pass: APP_CONFIG.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  try {
    await transporter.sendMail(emailContent);
    return "Email sent successfully";
  } catch (error) {
    console.log({ error });
    throw error;
  }
};

export default SendEmail;
