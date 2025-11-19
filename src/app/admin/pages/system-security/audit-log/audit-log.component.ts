import { Component } from '@angular/core';
import { AuditLog } from '../../../layout/models/audit-log.model';
@Component({
  selector: 'app-audit-log',
  standalone: false,
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.css'
})
export class AuditLogComponent {
logs: AuditLog[] = [];
  searchText = '';
  filterFromDate: string = '';
  filterToDate: string = '';

  currentPage = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs() {
    // Sample data - replace with API call
    this.logs = [
      { LogID: 1, User: 'John Doe', Action: 'Created User', Module: 'User Management', DateTime: '2025-10-12T09:15:00', IP: '192.168.1.10' },
      { LogID: 2, User: 'Jane Smith', Action: 'Updated Leave', Module: 'Leave Management', DateTime: '2025-10-12T10:30:00', IP: '192.168.1.11' },
      { LogID: 3, User: 'Admin', Action: 'Login', Module: 'Authentication', DateTime: '2025-10-12T08:45:00', IP: '192.168.1.12' }
    ];
  }

  // Filtering
  filteredLogs() {
    return this.logs.filter(log => {
      const searchMatch = log.User.toLowerCase().includes(this.searchText.toLowerCase()) ||
                          log.Action.toLowerCase().includes(this.searchText.toLowerCase()) ||
                          log.Module.toLowerCase().includes(this.searchText.toLowerCase());

      const fromDateMatch = this.filterFromDate ? new Date(log.DateTime) >= new Date(this.filterFromDate) : true;
      const toDateMatch = this.filterToDate ? new Date(log.DateTime) <= new Date(this.filterToDate) : true;

      return searchMatch && fromDateMatch && toDateMatch;
    });
  }

  paginatedLogs() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLogs().slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.filteredLogs().length / this.pageSize);
  }

  pagesArray() {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) this.currentPage = page;
  }

  resetFilters() {
    this.searchText = '';
    this.filterFromDate = '';
    this.filterToDate = '';
  }
}
