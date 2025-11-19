import { Component } from '@angular/core';
import { PushNotification } from '../../layout/models/push-notifications.model';
@Component({
  selector: 'app-push-notifications',
  standalone: false,
  templateUrl: './push-notifications.component.html',
  styleUrl: './push-notifications.component.css'
})
export class PushNotificationsComponent {
notification: PushNotification = { Title: '', Type: '', Message: '', IsActive: true };
  notifications: PushNotification[] = [];
  searchText = '';
  isEditMode = false;
  currentPage = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.notifications = [
      { Title: 'Leave Approved', Type: 'Leave', Message: 'Your leave request has been approved by manager.', IsActive: true },
      { Title: 'Payroll Processed', Type: 'Payroll', Message: 'Salary credited to your bank account.', IsActive: true },
      { Title: 'Attendance Reminder', Type: 'Attendance', Message: 'Please mark your attendance before 10:00 AM.', IsActive: false },
    ];
  }

  onSubmit(): void {
    if (this.isEditMode) {
      const index = this.notifications.findIndex(n => n.Title === this.notification.Title);
      if (index > -1) this.notifications[index] = { ...this.notification };
      this.isEditMode = false;
    } else {
      this.notifications.push({ ...this.notification });
    }
    this.resetForm();
  }

  editNotification(notification: PushNotification): void {
    this.notification = { ...notification };
    this.isEditMode = true;
  }

  deleteNotification(notification: PushNotification): void {
    this.notifications = this.notifications.filter(n => n !== notification);
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.notification.ImagePreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  resetForm(): void {
    this.notification = { Title: '', Type: '', Message: '', IsActive: true };
    this.isEditMode = false;
  }

  filteredNotifications(): PushNotification[] {
    return this.notifications.filter(n =>
      n.Title.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  paginatedNotifications(): PushNotification[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredNotifications().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredNotifications().length / this.pageSize);
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
