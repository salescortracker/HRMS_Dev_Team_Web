import { Component } from '@angular/core';
import { SMTPConfig } from '../../layout/models/smtp-config.model';
@Component({
  selector: 'app-smtp-settings',
  standalone: false,
  templateUrl: './smtp-settings.component.html',
  styleUrl: './smtp-settings.component.css'
})
export class SmtpSettingsComponent {
 smtp: SMTPConfig = { Host: '', Port: 587, Security: 'TLS', Username: '', Password: '', FromName: '', FromEmail: '', IsActive: true };
  smtpConfigs: SMTPConfig[] = [];
  isEditMode = false;
  currentPage = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.smtpConfigs = [
      { Host: 'smtp.gmail.com', Port: 587, Security: 'TLS', Username: 'admin@gmail.com', Password: '', FromName: 'HR Dept', FromEmail: 'hr@gmail.com', IsActive: true }
    ];
  }

  onSubmit(): void {
    if (this.isEditMode) {
      const index = this.smtpConfigs.findIndex(s => s.Host === this.smtp.Host);
      if (index > -1) this.smtpConfigs[index] = { ...this.smtp };
      this.isEditMode = false;
    } else {
      this.smtpConfigs.push({ ...this.smtp });
    }
    this.resetForm();
  }

  editSMTP(smtp: SMTPConfig): void {
    this.smtp = { ...smtp };
    this.isEditMode = true;
  }

  deleteSMTP(smtp: SMTPConfig): void {
    this.smtpConfigs = this.smtpConfigs.filter(s => s !== smtp);
  }

  resetForm(): void {
    this.smtp = { Host: '', Port: 587, Security: 'TLS', Username: '', Password: '', FromName: '', FromEmail: '', IsActive: true };
    this.isEditMode = false;
  }

  sendTestEmail(): void {
    alert(`Test email sent using host ${this.smtp.Host}`);
  }

  filteredSMTP(): SMTPConfig[] {
    return this.smtpConfigs;
  }

  paginatedSMTP(): SMTPConfig[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSMTP().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredSMTP().length / this.pageSize);
  }

  pagesArray(): number[] {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage = page;
  }
}
