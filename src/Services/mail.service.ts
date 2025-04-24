import "dotenv";
import fs from "fs";
import Handlebars from "handlebars";
import { SendMailOptions } from "nodemailer";
import path from "path";
import { APP_CONFIG } from "../config/app.config";
import { MAIL_SERVICE_SOCIAL_ICONS } from "../config/constant";
import { EmailDataInterface } from "../interfaces";
import SendEmail from "../utils/mail";

console.log(`Dirname: ${__dirname}`);

const baseTemplateSource = fs.readFileSync(
  path.join(__dirname, "..", "views/", "templates", "base_template.hbs"),
  "utf-8"
);
Handlebars.registerPartial("base_template", baseTemplateSource);

/**
 * Service for handling email-related operations
 */
class EmailService {
  renderTemplate(templateName: string, variables: {}) {
    const data = {
      logoUrl: "https://www.imghippo.com/i/DwmC5793Voo.png",
      imageUrl: "https://www.imghippo.com/i/DwmC5793Voo.png",
      companyName: "ICS ACADEMY",
      supportUrl: "",
      socialIcons: MAIL_SERVICE_SOCIAL_ICONS,
      companyWebsite: "https://",
      preferencesUrl: "",
      unsubscribe_url: "",
    };
    const newData = { ...data, ...variables };
    const templateSource = fs.readFileSync(
      path.join(__dirname, "..", "views/", "templates", `${templateName}.hbs`),
      "utf-8"
    );
    const template = Handlebars.compile(templateSource);
    return template(newData);
  }

  /**
   * Sends an email using a pre-defined template.
   *
   * @param {EmailDataInterface} emailData - The data required to send the email.
   * @param {string} emailData.template - The name of the template file (without extension).
   * @param {Object} emailData.variables - The dynamic variables to populate in the template.
   * @param {string} emailData.to - The recipient's email address.
   * @param {string} emailData.subject - The subject of the email.
   * @returns {Promise<{ message: string, status: string }>} - A promise resolving to an object containing the message and status.
   * @throws {Error} - Throws an error if the email fails to send.
   */
  async sendEmailTemplate(
    emailData: EmailDataInterface & { attachments?: any[] }
  ) {
    try {
      const html = this.renderTemplate(emailData.template, emailData.variables);

      const emailContent: SendMailOptions = {
        from: APP_CONFIG.SMTP_FROM_ADDRESS,
        to: emailData.to,
        subject: emailData.subject,
        html,
        attachments: emailData.attachments || [],
      };
      await SendEmail(emailContent);
      return {
        message: `Email successfully sent to ${emailData.to}`,
        status: "ok",
      };
    } catch (error: any) {
      console.log(`Failed to send email to ${emailData.to}`);
      throw new Error(`Failed to send email: " ${error.message}`);
    }
  }
}

export const emailService = new EmailService();
export default EmailService;
