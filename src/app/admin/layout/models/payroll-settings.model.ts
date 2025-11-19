export interface PayrollSetting {
  id: number;
  componentName: string;  // e.g., Basic Salary, HRA, Allowance
  componentType: string;  // e.g., Earnings, Deduction
  amountType: string;     // e.g., Fixed, Percentage
  amount: number;
  isTaxable: boolean;
  isActive: boolean;
}