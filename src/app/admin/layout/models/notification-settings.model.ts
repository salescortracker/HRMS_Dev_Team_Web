export interface NotificationSetting {
  id: number;
  notificationType: string;  // e.g., Email, SMS, Push
  templateName: string;      // e.g., Leave Approval, Timesheet Reminder
  frequency: string;         // e.g., Immediate, Daily, Weekly
  isActive: boolean;
}