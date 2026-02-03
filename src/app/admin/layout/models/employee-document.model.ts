export interface EmployeeDocument {
id: number;
  type: string;
  title: string;
  number: string;
  issuedDate: string;   
  expiryDate: string;   
  fileName: string;    
  filePath: string; 
  confidential: boolean;
  remarks: string;
}
