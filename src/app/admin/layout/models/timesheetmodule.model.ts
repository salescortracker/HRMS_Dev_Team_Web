export interface TimesheetProject {
  projectName: string;
  startTime: string;
  endTime: string;
  totalHours: string;
totalHoursText?: string;

  overtimeHours: string;
}

export interface TimesheetModel {
  employeeName: string;
  employeeCode: string;
  date: string;
  comments: string;
  attachment: File | null;
  projects: TimesheetProject[];
  status: string;
}