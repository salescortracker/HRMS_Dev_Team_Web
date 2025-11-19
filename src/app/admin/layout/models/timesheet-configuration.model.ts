export interface TimesheetConfig {
  Frequency: string;
  ApprovalRequired: boolean;
  LockAfterSubmit: boolean;
  OvertimeAllowed: boolean;
  RoundingPolicy: string;
  OptionalFields: string;
  Description: string;
}