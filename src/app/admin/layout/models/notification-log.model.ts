export interface NotificationLog {
  Type: string; // Email / SMS / Push
  Recipient: string;
  Subject: string;
  Status: string; // Sent / Failed
  Date: Date;
}