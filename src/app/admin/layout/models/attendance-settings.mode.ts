export interface AttendanceSetting {
  id: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  gracePeriod: number; // in minutes
  overtimeAllowed: boolean;
  isActive: boolean;
}