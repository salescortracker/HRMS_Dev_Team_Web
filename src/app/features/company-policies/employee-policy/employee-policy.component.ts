import { Component ,Input} from '@angular/core';
interface Policy {
  Title: string;
  Category: string;
  EffectiveDate: Date;
  Description?: string;
  FileName?: string;
  FileUrl?: string;
}
@Component({
  selector: 'app-employee-policy',
  standalone: false,
  templateUrl: './employee-policy.component.html',
  styleUrl: './employee-policy.component.css'
})
export class EmployeePolicyComponent {
categories: string[] = ['HR Policy', 'Compliance', 'IT Security', 'Finance', 'General'];

  policies: Policy[] = [
    {
      Title: 'Leave Policy 2025',
      Category: 'HR Policy',
      EffectiveDate: new Date('2025-01-01'),
      Description: 'Updated leave policy for 2025 including casual, sick and paid leaves.',
      FileName: 'LeavePolicy2025.pdf',
      FileUrl: 'assets/policies/LeavePolicy2025.pdf'
    },
    {
      Title: 'Expense Reimbursement Policy',
      Category: 'Finance',
      EffectiveDate: new Date('2025-03-01'),
      Description: 'Procedure and limits for employee expense claims.',
      FileName: 'ExpensePolicy.pdf',
      FileUrl: 'assets/policies/ExpensePolicy.pdf'
    }
  ];

  selectedCategory: string = '';
  fromDate?: string;
  toDate?: string;

  applyFilter() { }

  filteredPolicies(): Policy[] {
    return this.policies.filter(p => {
      const matchCategory = this.selectedCategory ? p.Category === this.selectedCategory : true;
      const matchFrom = this.fromDate ? new Date(p.EffectiveDate) >= new Date(this.fromDate) : true;
      const matchTo = this.toDate ? new Date(p.EffectiveDate) <= new Date(this.toDate) : true;
      return matchCategory && matchFrom && matchTo;
    });
  }
}
