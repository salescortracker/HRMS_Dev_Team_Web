import { Component } from '@angular/core';
import { SmsTemplate } from '../../layout/models/sms-template.model';
@Component({
  selector: 'app-sms-templates',
  standalone: false,
  templateUrl: './sms-templates.component.html',
  styleUrl: './sms-templates.component.css'
})
export class SmsTemplatesComponent {
smsTemplate: SmsTemplate = { TemplateName: '', TemplateType: '', MessageContent: '', IsActive: true };
  templates: SmsTemplate[] = [];
  searchText = '';
  isEditMode = false;
  currentPage = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.templates = [
      { TemplateName: 'Leave Approved', TemplateType: 'Leave', MessageContent: 'Your leave request has been approved.', IsActive: true },
      { TemplateName: 'Expense Submitted', TemplateType: 'Expense', MessageContent: 'Your expense claim has been submitted successfully.', IsActive: true },
      { TemplateName: 'Payroll Released', TemplateType: 'Payroll', MessageContent: 'Your salary has been credited to your account.', IsActive: false },
    ];
  }

  onSubmit(): void {
    if (this.isEditMode) {
      const index = this.templates.findIndex(t => t.TemplateName === this.smsTemplate.TemplateName);
      if (index > -1) this.templates[index] = { ...this.smsTemplate };
      this.isEditMode = false;
    } else {
      this.templates.push({ ...this.smsTemplate });
    }
    this.resetForm();
  }

  editTemplate(template: SmsTemplate): void {
    this.smsTemplate = { ...template };
    this.isEditMode = true;
  }

  deleteTemplate(template: SmsTemplate): void {
    this.templates = this.templates.filter(t => t !== template);
  }

  resetForm(): void {
    this.smsTemplate = { TemplateName: '', TemplateType: '', MessageContent: '', IsActive: true };
    this.isEditMode = false;
  }

  filteredTemplates(): SmsTemplate[] {
    return this.templates.filter(t =>
      t.TemplateName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  paginatedTemplates(): SmsTemplate[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTemplates().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredTemplates().length / this.pageSize);
  }

  pagesArray(): number[] {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
  }
}
