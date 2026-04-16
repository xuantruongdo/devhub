export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface VerifyEmailProps {
  email: string;
  fullName: string;
  token: string;
}
