export interface EmployeeResignation {
  resignationId?: number;        // Auto-increment primary key
  employeeId?: string;           // Changed to string (varchar)
  resignationType?: string;
  noticePeriod?: string;
  lastWorkingDay?: string;       // Use string for date binding in Angular
  resignationReason?: string;
  status?: string;
  createdBy?: string;
  createdAt?: string;            // string => ISO date format from API
  modifiedBy?: string;
  modifiedAt?: string;
  companyId?: number;
  regionId?: number;
  userId?: number;
  employeeCode?: number; 
}