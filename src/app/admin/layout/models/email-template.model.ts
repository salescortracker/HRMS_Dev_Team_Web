export interface EmailTemplate {
  id: number;
  templateName: string;   // e.g., Leave Approval, Payroll Notification
  subject: string;
  body: string;
  module: string;         // e.g., Leave, Payroll, Attendance
  isActive: boolean;
}