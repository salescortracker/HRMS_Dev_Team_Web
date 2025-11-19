export interface ApprovalLevel {
  level: number;
  approver: string;
  email: string;
  isActive: boolean;
}

export interface ApprovalWorkflow {
  id: number;
  module: string; // Leave, Attendance, Expense, Payroll
  name: string;
  description: string;
  levels: ApprovalLevel[];
  isActive: boolean;
}