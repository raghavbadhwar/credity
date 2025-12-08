import { Resend } from "resend";

// Email service configuration - supports multiple providers
interface EmailConfig {
    provider: "resend" | "console";
    apiKey?: string;
}

interface TeamInviteParams {
    to: string;
    inviterName: string;
    organizationName: string;
    role: string;
    inviteLink: string;
}

interface CredentialNotificationParams {
    to: string;
    recipientName: string;
    credentialType: string;
    issuerName: string;
    viewLink: string;
}

class EmailService {
    private provider: "resend" | "console";
    private resend?: Resend;

    constructor(config: EmailConfig) {
        this.provider = config.provider;

        if (config.provider === "resend" && config.apiKey) {
            this.resend = new Resend(config.apiKey);
        }
    }

    async sendTeamInvite(params: TeamInviteParams): Promise<void> {
        const subject = `You've been invited to join ${params.organizationName} on CredVerse`;
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: bold; color: #3B82F6; }
          .content { background: #f8fafc; padding: 30px; border-radius: 12px; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; margin-top: 40px; color: #666; font-size: 14px; }
          .role-badge { display: inline-block; background: #E0E7FF; color: #4338CA; padding: 4px 12px; border-radius: 4px; font-size: 14px; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 CredVerse</div>
          </div>
          <div class="content">
            <h2>You're Invited!</h2>
            <p><strong>${params.inviterName}</strong> has invited you to join <strong>${params.organizationName}</strong> as a <span class="role-badge">${params.role}</span>.</p>
            <p>CredVerse is a blockchain-powered credential platform that helps organizations issue, manage, and verify digital credentials.</p>
            <center>
              <a href="${params.inviteLink}" class="button">Accept Invitation</a>
            </center>
            <p style="font-size: 14px; color: #666;">If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2025 CredVerse. Secure Credentials, Trusted Everywhere.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        await this.send(params.to, subject, html);
    }

    async sendCredentialNotification(params: CredentialNotificationParams): Promise<void> {
        const subject = `Your new credential from ${params.issuerName}`;
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: bold; color: #3B82F6; }
          .content { background: #f8fafc; padding: 30px; border-radius: 12px; }
          .credential-card { background: white; border: 2px solid #3B82F6; border-radius: 12px; padding: 24px; margin: 20px 0; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { text-align: center; margin-top: 40px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 CredVerse</div>
          </div>
          <div class="content">
            <h2>Congratulations, ${params.recipientName}! 🎉</h2>
            <p>A new credential has been issued to you.</p>
            <div class="credential-card">
              <h3 style="margin: 0 0 8px 0; color: #1E40AF;">${params.credentialType}</h3>
              <p style="margin: 0; color: #666;">Issued by ${params.issuerName}</p>
            </div>
            <center>
              <a href="${params.viewLink}" class="button">View Credential</a>
            </center>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">This credential is securely stored on the blockchain and can be verified by anyone using the link above.</p>
          </div>
          <div class="footer">
            <p>© 2025 CredVerse. Secure Credentials, Trusted Everywhere.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        await this.send(params.to, subject, html);
    }

    private async send(to: string, subject: string, html: string): Promise<void> {
        if (this.provider === "resend" && this.resend) {
            await this.resend.emails.send({
                from: "CredVerse <noreply@credverse.app>",
                to,
                subject,
                html
            });
        } else {
            // Console fallback for development
            console.log("=".repeat(60));
            console.log("📧 EMAIL (Console Mode)");
            console.log("=".repeat(60));
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log("-".repeat(60));
            console.log("HTML Email Preview (would be sent in production)");
            console.log("=".repeat(60));
        }
    }
}

// Initialize email service
// Will use Resend if RESEND_API_KEY is set, otherwise falls back to console logging
export const emailService = new EmailService({
    provider: process.env.RESEND_API_KEY ? "resend" : "console",
    apiKey: process.env.RESEND_API_KEY
});
