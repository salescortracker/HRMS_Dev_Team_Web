export interface AttendanceConfig {
  Mode: string;
  GracePeriod: number;
  LateMarkThreshold: number;
  EarlyLeaveThreshold: number;
  ShiftRequired: boolean;
  AutoAbsent: boolean;
  OvertimeCalc: string;
  Description: string;
}