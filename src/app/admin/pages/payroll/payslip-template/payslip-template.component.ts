import { Component } from '@angular/core';
import { PayslipTemplate } from '../../../layout/models/payslip-template.model';

@Component({
  selector: 'app-payslip-template',
  standalone: false,
  templateUrl: './payslip-template.component.html',
  styleUrl: './payslip-template.component.css'
})
export class PayslipTemplateComponent {
 
  template: PayslipTemplate = {
    Name: '',
    Header: '',
    Footer: '',
    IncludeEmployeeInfo: true,
    IncludeEarnings: true,
    IncludeDeductions: true,
    IncludeNetPay: true,
    IsActive: true
  };

  templates: PayslipTemplate[] = [];
  isEditMode = false;

  ngOnInit(): void {
    this.templates = [
      { Name: 'Default Template', Header: 'Company XYZ', Footer: 'Thank you for your service', IncludeEmployeeInfo: true, IncludeEarnings: true, IncludeDeductions: true, IncludeNetPay: true, IsActive: true }
    ];
  }

  onSubmit(): void {
    if (this.isEditMode) {
      const index = this.templates.findIndex(t => t.Name === this.template.Name);
      if (index > -1) this.templates[index] = { ...this.template };
      this.isEditMode = false;
    } else {
      this.templates.push({ ...this.template });
    }
    this.resetForm();
  }

  editTemplate(t: PayslipTemplate): void {
    this.template = { ...t };
    this.isEditMode = true;
  }

  deleteTemplate(t: PayslipTemplate): void {
    this.templates = this.templates.filter(x => x !== t);
  }

  resetForm(): void {
    this.template = {
      Name: '',
      Header: '',
      Footer: '',
      IncludeEmployeeInfo: true,
      IncludeEarnings: true,
      IncludeDeductions: true,
      IncludeNetPay: true,
      IsActive: true
    };
    this.isEditMode = false;
  }

  downloadPayslip(): void {
    const options = {
      filename: `${this.template.Name || 'Payslip'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
   // html2pdf().from(this.payslipContent.nativeElement).set(options).save();
  }
}
