import { Service } from "typedi";
import nodemailer, { Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path";
import { SendMailOptions, VerifyEmailProps } from "../types/mail";

@Service()
export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private async sendMail({ to, subject, html }: SendMailOptions) {
    try {
      await this.transporter.sendMail({
        from: `"No Reply" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });

      console.log(`[MAIL] Sent to ${to}`);
    } catch (err) {
      console.error("[MAIL ERROR]", err);
      throw new Error("Send email failed");
    }
  }

  private async renderTemplate(
    templateName: string,
    data: Record<string, string>,
  ) {
    const filePath = path.join(
      process.cwd(),
      "templates",
      `${templateName}.ejs`,
    );

    return ejs.renderFile(filePath, data);
  }

  async sendVerifyEmail({ email, fullName, token }: VerifyEmailProps) {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const html = await this.renderTemplate("verify-email", {
      verifyUrl,
      fullName,
    });

    return this.sendMail({
      to: email,
      subject: "Verify your account",
      html,
    });
  }
}
