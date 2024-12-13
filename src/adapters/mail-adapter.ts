import nodemailer, { SentMessageInfo } from "nodemailer";
import { google } from "googleapis";
import { Settings } from "../settings";
import SMTPTransport from "nodemailer/lib/smtp-transport";

interface MailAdapterInterface {
  sendMail(email: string, subject: string, text: string): Promise<SentMessageInfo>;
}

export class mailAdapter implements MailAdapterInterface {
  private oauthClient: any | null = null;
  private transporter: nodemailer.Transporter | null = null;

  private getOAuthClient() {
    if (!this.oauthClient) {
      const OAuth2 = google.auth.OAuth2;
      this.oauthClient = new OAuth2(Settings.CLIENT_ID, Settings.CLIENT_SECRET);
      this.oauthClient.setCredentials({ refresh_token: Settings.GOOGLE_REFRESH_TOKEN });
    }
    return this.oauthClient;
  }

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      const accessToken = (await this.getOAuthClient().getAccessToken()).token;

      const transportOptions: SMTPTransport.Options = {
        service: 'gmail',
        secure: false,
        auth: {
          type: 'OAuth2',
          user: "backendpochta@gmail.com",
          clientId: Settings.CLIENT_ID,
          clientSecret: Settings.CLIENT_SECRET,
          refreshToken: Settings.GOOGLE_REFRESH_TOKEN,
          accessToken: accessToken || undefined,
        },
      };

      this.transporter = nodemailer.createTransport(transportOptions);
    }
    return this.transporter;
  }

  async sendMail(email: string, subject: string, text: string): Promise<SentMessageInfo> {
    const transporter = await this.getTransporter();
    const info = await transporter.sendMail({
      from: '"Gibbie Backend" <backendpochta@gmail.com>',
      to: email,
      subject: subject,
      text: text,
    });

    return ;
  }
}
