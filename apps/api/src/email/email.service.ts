import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Use environment variables or defaults for development
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("SMTP_HOST") || "smtp.gmail.com",
      port: this.configService.get<number>("SMTP_PORT") || 587,
      secure: false,
      auth: {
        user: this.configService.get<string>("SMTP_USER") || "",
        pass: this.configService.get<string>("SMTP_PASS") || "",
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>("SMTP_FROM") || "noreply@tasksuite.com",
        to,
        subject,
        html,
      });
      console.log("Email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("Failed to send email:", error);
      // Don't throw - email failures shouldn't break the app
      return null;
    }
  }

  async sendEstimateNotification(clientEmail: string, estimateTitle: string, estimateId: string) {
    const html = `
      <h2>New Estimate Available</h2>
      <p>You have a new estimate: <strong>${estimateTitle}</strong></p>
      <p><a href="${this.configService.get<string>("CLIENT_PORTAL_URL") || "http://localhost:3000"}/client/estimates/${estimateId}">View Estimate</a></p>
    `;
    return this.sendEmail(clientEmail, "New Estimate Available", html);
  }

  async sendJobUpdateNotification(clientEmail: string, jobTitle: string, status: string) {
    const html = `
      <h2>Job Status Update</h2>
      <p>Your job "<strong>${jobTitle}</strong>" status has been updated to: <strong>${status}</strong></p>
      <p><a href="${this.configService.get<string>("CLIENT_PORTAL_URL") || "http://localhost:3000"}/client/jobs">View Job</a></p>
    `;
    return this.sendEmail(clientEmail, "Job Status Update", html);
  }

  async sendInvoiceNotification(clientEmail: string, invoiceNumber: string, amount: number, dueDate?: Date) {
    const html = `
      <h2>New Invoice</h2>
      <p>You have a new invoice: <strong>${invoiceNumber}</strong></p>
      <p>Amount: <strong>$${amount.toFixed(2)}</strong></p>
      ${dueDate ? `<p>Due Date: <strong>${new Date(dueDate).toLocaleDateString()}</strong></p>` : ""}
      <p><a href="${this.configService.get<string>("CLIENT_PORTAL_URL") || "http://localhost:3000"}/client/invoices">Pay Invoice</a></p>
    `;
    return this.sendEmail(clientEmail, "New Invoice", html);
  }
}

