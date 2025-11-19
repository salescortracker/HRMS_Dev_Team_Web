export interface SMTPConfig {
  Host: string;
  Port: number;
  Security: string;
  Username: string;
  Password: string;
  FromName: string;
  FromEmail: string;
  IsActive: boolean;
}