export interface LeaveRequest {
  appliedDate: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: string;
  fileName?: string; 
   isHalfDay: boolean;
  managerId?: number; 
}