import { Component } from '@angular/core';
import { NotificationSetting } from '../../layout/models/notification-settings.model';
@Component({
  selector: 'app-notification-settings',
  standalone: false,
  templateUrl: './notification-settings.component.html',
  styleUrl: './notification-settings.component.css'
})
export class NotificationSettingsComponent {
searchText: string = '';
  pageSize: number = 5;
  currentPage: number = 1;
  isEditMode: boolean = false;

  notificationTypes: string[] = ['Email', 'SMS', 'Push'];
  frequencyOptions: string[] = ['Immediate', 'Daily', 'Weekly'];

  newSetting: NotificationSetting = {
    id: 0,
    notificationType: '',
    templateName: '',
    frequency: 'Immediate',
    isActive: true
  };

  settings: NotificationSetting[] = [
    { id: 1, notificationType: 'Email', templateName: 'Leave Approval', frequency: 'Immediate', isActive: true },
    { id: 2, notificationType: 'SMS', templateName: 'Timesheet Reminder', frequency: 'Daily', isActive: true },
    { id: 3, notificationType: 'Push', templateName: 'Expense Approval', frequency: 'Immediate', isActive: false }
  ];

  addOrUpdateSetting() {
    if(this.isEditMode){
      const index = this.settings.findIndex(s => s.id === this.newSetting.id);
      if(index > -1) this.settings[index] = { ...this.newSetting };
    } else {
      this.newSetting.id = this.settings.length + 1;
      this.settings.push({ ...this.newSetting });
    }
    this.resetForm();
  }

  editSetting(setting: NotificationSetting) {
    this.newSetting = { ...setting };
    this.isEditMode = true;
  }

  deleteSetting(setting: NotificationSetting) {
    this.settings = this.settings.filter(s => s.id !== setting.id);
  }

  resetForm() {
    this.newSetting = {
      id: 0,
      notificationType: '',
      templateName: '',
      frequency: 'Immediate',
      isActive: true
    };
    this.isEditMode = false;
  }

  filteredSettings() {
    return this.settings.filter(s => s.templateName.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  totalPages() {
    return Math.ceil(this.filteredSettings().length / this.pageSize);
  }

  pagesArray() {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  paginatedSettings() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSettings().slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if(page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
  }
}
