import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class SmsService {
  private transporter: nodemailer.Transporter;

  // Common carrier email-to-SMS gateways
  private carrierGateways: { [key: string]: string } = {
    att: "@txt.att.net",
    verizon: "@vtext.com",
    tmobile: "@tmomail.net",
    sprint: "@messaging.sprintpcs.com",
    uscellular: "@email.uscc.net",
    cricket: "@sms.cricketwireless.net",
    boost: "@sms.myboostmobile.com",
    virgin: "@vmobl.com",
    metropcs: "@mymetropcs.com",
    republic: "@text.republicwireless.com",
    googlefi: "@msg.fi.google.com",
    default: "@vtext.com", // Default to Verizon if not specified
  };

  constructor(private configService: ConfigService) {
    // Use the same SMTP configuration as EmailService
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

  /**
   * Converts a phone number to an email address using carrier email-to-SMS gateway
   * @param phoneNumber Phone number (e.g., "1234567890" or "+11234567890")
   * @param carrier Optional carrier name (e.g., "verizon", "att", "tmobile")
   * @returns Email address for SMS gateway
   */
  private phoneToEmail(phoneNumber: string, carrier?: string): string {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    
    // Use specified carrier or default
    const carrierKey = (carrier || this.configService.get<string>("SMS_DEFAULT_CARRIER") || "default").toLowerCase();
    const gateway = this.carrierGateways[carrierKey] || this.carrierGateways.default;
    
    return `${digitsOnly}${gateway}`;
  }

  /**
   * Sends SMS via email-to-SMS gateway using SMTP
   * @param to Phone number (will be converted to email)
   * @param message SMS message text
   * @param carrier Optional carrier name
   */
  async sendSms(to: string, message: string, carrier?: string) {
    try {
      // Convert phone number to email address
      const emailAddress = this.phoneToEmail(to, carrier);
      const from = this.configService.get<string>("SMTP_FROM") || "noreply@tasksuite.com";
      
      console.log(`📱 Attempting to send SMS:`);
      console.log(`   Phone Number: ${to}`);
      console.log(`   Carrier Email Gateway: ${emailAddress}`);
      console.log(`   Message: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
      
      // Send email via SMTP (carrier will convert to SMS)
      const info = await this.transporter.sendMail({
        from,
        to: emailAddress,
        subject: "", // Some carriers ignore subject, but include it anyway
        text: message, // Plain text for SMS
        html: `<p>${message.replace(/\n/g, "<br>")}</p>`, // HTML fallback
      });
      
      console.log(`✅ SMS sent successfully via email gateway!`);
      console.log(`   Phone: ${to} → Email: ${emailAddress}`);
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Response: ${info.response}`);
      return { success: true, messageId: info.messageId, emailAddress };
    } catch (error) {
      console.error(`❌ Failed to send SMS to ${to}:`, error);
      // Don't throw - SMS failures shouldn't break the app
      return { success: false, error: error.message };
    }
  }

  async sendEstimateNotification(phoneNumber: string, estimateTitle: string, publicToken: string) {
    const baseUrl = this.configService.get<string>("CLIENT_PORTAL_URL") || "http://localhost:3000";
    const publicUrl = `${baseUrl}/estimate/${publicToken}`;
    const message = `New estimate: ${estimateTitle}. View & approve: ${publicUrl}`;
    return this.sendSms(phoneNumber, message);
  }

  async sendInvoiceNotification(phoneNumber: string, invoiceNumber: string, amount: number, dueDate?: Date) {
    const dueDateStr = dueDate ? ` Due: ${dueDate.toLocaleDateString()}` : "";
    const message = `Invoice ${invoiceNumber} for $${amount.toFixed(2)}${dueDateStr}. View at: ${this.getInvoiceUrl(invoiceNumber)}`;
    return this.sendSms(phoneNumber, message);
  }

  private getEstimateUrl(estimateId: string): string {
    const baseUrl = this.configService.get<string>("CLIENT_PORTAL_URL") || "http://localhost:3000";
    return `${baseUrl}/client/estimates/${estimateId}`;
  }

  private getInvoiceUrl(invoiceNumber: string): string {
    const baseUrl = this.configService.get<string>("CLIENT_PORTAL_URL") || "http://localhost:3000";
    return `${baseUrl}/client/invoices/${invoiceNumber}`;
  }
}

