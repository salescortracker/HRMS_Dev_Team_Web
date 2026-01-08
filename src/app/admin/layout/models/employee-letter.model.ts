export interface EmployeeLetter {
  id: number;
  documentType: string;
  title: string;
  empCode: string;
  empName: string;
  issuedDate: string;
  validityDate?: string;
  fileName?: string;
  remarks?: string;
  confidential: boolean;
}
