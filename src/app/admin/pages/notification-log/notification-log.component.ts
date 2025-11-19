import { Component } from '@angular/core';
import { NotificationLog } from '../../layout/models/notification-log.model';
@Component({
  selector: 'app-notification-log',
  standalone: false,
  templateUrl: './notification-log.component.html',
  styleUrl: './notification-log.component.css'
})
export class NotificationLogComponent {
 logs: NotificationLog[] = [];
  searchText: string = '';
  currentPage: number = 1;
  pageSize: number = 5;

  ngOnInit(): void {
    this.logs = [
      { Type: 'Email', Recipient: 'adrian@example.com', Subject: 'Leave Approval', Status: 'Sent', Date: new Date() },
      { Type: 'SMS', Recipient: '+1234567890', Subject: 'Attendance Reminder', Status: 'Sent', Date: new Date() },
      { Type: 'Push', Recipient: 'Adrian', Subject: 'Policy Update', Status: 'Failed', Date: new Date() },
      // Add more sample data as needed
    ];
  }

  filteredLogs(): NotificationLog[] {
    if (!this.searchText) return this.logs;
    return this.logs.filter(log =>
      log.Recipient.toLowerCase().includes(this.searchText.toLowerCase()) ||
      log.Subject.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  paginatedLogs(): NotificationLog[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLogs().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredLogs().length / this.pageSize);
  }

  pagesArray(): number[] {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage = page;
  }

  resetFilter(): void {
    this.searchText = '';
    this.currentPage = 1;
  }

  viewDetails(log: NotificationLog): void {
    alert(`Type: ${log.Type}\nRecipient: ${log.Recipient}\nSubject: ${log.Subject}\nStatus: ${log.Status}\nDate: ${log.Date}`);
  }
}
