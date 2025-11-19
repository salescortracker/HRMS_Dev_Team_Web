export interface PayslipTemplate {
  Name: string;
  Header?: string;
  Footer?: string;
  IncludeEmployeeInfo: boolean;
  IncludeEarnings: boolean;
  IncludeDeductions: boolean;
  IncludeNetPay: boolean;
  IsActive: boolean;
}