export interface User {
  UserID?: number;
  FullName: string;
  Email: string;
  Mobile?: string;
  Role: string;
  Department: string;
  Password?: string;
  IsActive: boolean;
  sendEmailOption?: 'auto' | 'manual';
}