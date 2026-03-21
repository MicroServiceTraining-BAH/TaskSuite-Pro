import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Use environment variables or defaults for development
    const smtpUser = this.configService.get<string>("SMTP_USER") || "";
    const smtpPass = this.configService.get<string>("SMTP_PASS") || "";
    
    // Warn if SMTP credentials are not configured
    if (!smtpUser || !smtpPass) {
      console.warn("⚠️  SMTP credentials not configured!");
      console.warn("   Set SMTP_USER and SMTP_PASS in your .env file to enable email sending.");
      console.warn("   For Gmail, use an App Password: https://support.google.com/accounts/answer/185833");
    }
    
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("SMTP_HOST") || "smtp.gmail.com",
      port: this.configService.get<number>("SMTP_PORT") || 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const smtpUser = this.configService.get<string>("SMTP_USER") || "";
      const smtpPass = this.configService.get<string>("SMTP_PASS") || "";
      
      // Check if SMTP is configured
      if (!smtpUser || !smtpPass) {
        console.error(`❌ Cannot send email: SMTP credentials not configured`);
        console.error(`   Please set SMTP_USER and SMTP_PASS in your .env file`);
        return null;
      }
      
      const from = this.configService.get<string>("SMTP_FROM") || smtpUser;
      console.log(`📧 Attempting to send email:`);
      console.log(`   From: ${from}`);
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      
      console.log(`✅ Email sent successfully!`);
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Response: ${info.response}`);
      return info;
    } catch (error: any) {
      console.error(`❌ Failed to send email to ${to}:`);
      console.error(`   Error: ${error.message}`);
      if (error.code) {
        console.error(`   Error Code: ${error.code}`);
      }
      if (error.response) {
        console.error(`   SMTP Response: ${error.response}`);
      }
      // Don't throw - email failures shouldn't break the app
      return null;
    }
  }

  async sendEstimateNotification(clientEmail: string, estimateTitle: string, publicToken: string) {
    const baseUrl = this.configService.get<string>("CLIENT_PORTAL_URL") || "http://localhost:3000";
    const publicUrl = `${baseUrl}/estimate/${publicToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Estimate Available</h2>
        <p>You have a new estimate: <strong>${estimateTitle}</strong></p>
        <p style="margin: 30px 0;">
          <a href="${publicUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View & Approve Estimate
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          You can view and approve this estimate without creating an account. Simply click the button above.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${publicUrl}" style="color: #007bff;">${publicUrl}</a>
        </p>
      </div>
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

  async sendTeamMemberWelcome(
    userEmail: string,
    userName: string,
    companyName: string,
    password: string,
    loginUrl: string = "http://localhost:3000/login"
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to ${companyName}!</h2>
        <p>Hello ${userName},</p>
        <p>You have been added as a team member to <strong>${companyName}</strong> on TaskSuite Pro.</p>
        <p>You can now access your account using the following credentials:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email (Username):</strong> ${userEmail}</p>
          <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
        </div>
        <p><a href="${loginUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">Login to TaskSuite Pro</a></p>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          <strong>Security Note:</strong> Please change your password after your first login.
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 10px;">
          If you have any questions, please contact your administrator.
        </p>
      </div>
    `;
    return this.sendEmail(userEmail, `Welcome to ${companyName} - TaskSuite Pro`, html);
  }
}

