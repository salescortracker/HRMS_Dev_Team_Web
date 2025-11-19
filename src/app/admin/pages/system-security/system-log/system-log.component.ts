import { Component } from '@angular/core';
import { SystemLog } from '../../../layout/models/system-log.model';
@Component({
  selector: 'app-system-log',
  standalone: false,
  templateUrl: './system-log.component.html',
  styleUrl: './system-log.component.css'
})
export class SystemLogComponent {
logs: SystemLog[] = [];
  searchText = '';
  filterType: string = '';
  filterFromDate: string = '';
  logTypes: string[] = ['Info', 'Warning', 'Error', 'Critical'];

  currentPage = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs() {
    // Sample data - replace with API call
    this.logs = [
      { LogID: 1, Event: 'Application Started', Module: 'System', Type: 'Info', DateTime: '2025-10-12T08:00:00', Details: 'System boot successful' },
      { LogID: 2, Event: 'Database Connection Failed', Module: 'Database', Type: 'Error', DateTime: '2025-10-12T09:15:00', Details: 'Timeout connecting to SQL Server' },
      { LogID: 3, Event: 'Scheduled Task Executed', Module: 'Scheduler', Type: 'Info', DateTime: '2025-10-12T10:30:00', Details: 'Backup task completed successfully' }
    ];
  }

  filteredLogs() {
    return this.logs.filter(log => {
      const searchMatch = log.Event.toLowerCase().includes(this.searchText.toLowerCase()) ||
                          log.Module.toLowerCase().includes(this.searchText.toLowerCase()) ||
                          log.Details.toLowerCase().includes(this.searchText.toLowerCase());

      const typeMatch = this.filterType ? log.Type === this.filterType : true;
      const fromDateMatch = this.filterFromDate ? new Date(log.DateTime) >= new Date(this.filterFromDate) : true;

      return searchMatch && typeMatch && fromDateMatch;
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
    this.filterType = '';
    this.filterFromDate = '';
  }
}
