import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { TimesheetService } from '../service/timesheet.service';
@Component({
  selector: 'app-timesheet-approval',
  standalone: false,
  templateUrl: './timesheet-approval.component.html',
  styleUrl: './timesheet-approval.component.css'
})
export class TimesheetApprovalComponent {
selectAll = false;
  selectedTimesheet: any = null;
  timesheetList: any[] = [];
  managerId!: number;

  // ===== PAGINATION =====
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // ===== SORTING =====
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private timesheetService: TimesheetService) {}

  ngOnInit() {
    this.managerId = Number(sessionStorage.getItem('UserId'));
    this.loadManagerTimesheets();
  }

  // ================= LOAD MANAGER TIMESHEETS =================
  loadManagerTimesheets() {
    this.timesheetService.getManagerTimesheets(this.managerId).subscribe(res => {
      this.timesheetList = res.map((x: any) => {
        const totalMinutes = x.projects?.reduce(
          (sum: number, p: any) => sum + (Number(p.totalMinutes) || 0), 0
        ) || 0;

        const otMinutes = x.projects?.reduce(
          (sum: number, p: any) => sum + (Number(p.otMinutes) || 0), 0
        ) || 0;

        const totalHoursText = `${Math.floor(totalMinutes / 60)} Hours ${totalMinutes % 60} Minutes`;
        const otHoursText = otMinutes > 0
          ? `${Math.floor(otMinutes / 60)} Hours ${otMinutes % 60} Minutes`
          : '0 Hours';

        return {
          ...x,
          selected: false,
          comments: x.comments || '',
          totalMinutes,
          otMinutes,
          totalHoursText,
          otHoursText
        };
      });
    });
  }

  // ================= SELECT ALL =================
  toggleSelectAll() {
    this.timesheetList.forEach(t => {
      if (t.status === 'Submitted') t.selected = this.selectAll;
    });
  }

  checkSelectAll() {
    this.selectAll = this.timesheetList
      .filter(t => t.status === 'Submitted')
      .every(t => t.selected);
  }

  // ================= VIEW MODAL =================
  openViewModal(ts: any) {
    this.selectedTimesheet = null;

    this.timesheetService.getTimesheetDetail(ts.timesheetId).subscribe(res => {
      this.selectedTimesheet = res.data ?? res;

      const totalMinutes = this.selectedTimesheet.projects?.reduce(
        (sum: number, p: any) => sum + (Number(p.totalMinutes) || 0), 0
      ) || 0;

      const otMinutes = this.selectedTimesheet.projects?.reduce(
        (sum: number, p: any) => sum + (Number(p.otMinutes) || 0), 0
      ) || 0;

      this.selectedTimesheet.totalMinutes = totalMinutes;
      this.selectedTimesheet.otMinutes = otMinutes;
      this.selectedTimesheet.totalHoursText =
        `${Math.floor(totalMinutes / 60)} Hours ${totalMinutes % 60} Minutes`;
      this.selectedTimesheet.otHoursText =
        otMinutes > 0
          ? `${Math.floor(otMinutes / 60)} Hours ${otMinutes % 60} Minutes`
          : '0 Hours';

      this.selectedTimesheet.projects = this.selectedTimesheet.projects || [];
      this.selectedTimesheet.comments = this.selectedTimesheet.comments || '';
    });
  }

  // ================= APPROVE / REJECT =================
  approveSelected() {
    const selected = this.timesheetList.filter(t => t.selected);
    if (!selected.length) {
      Swal.fire("No selection", "Select at least one record", "warning");
      return;
    }

    Swal.fire({
      title: "Approve selected timesheets?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve"
    }).then(result => {
      if (result.isConfirmed) {
        const ids = selected.map(x => x.timesheetId);
        const comments = selected.map(x => x.comments || '').join(', ');
        this.timesheetService.approveTimesheets(ids, comments).subscribe(() => {
          Swal.fire("Approved!", "Timesheets approved successfully.", "success");
          selected.forEach(ts => {
            ts.status = "Approved";
            ts.selected = false;
          });
          this.selectAll = false;
        });
      }
    });
  }

  rejectSelected() {
    const selected = this.timesheetList.filter(t => t.selected);
    if (!selected.length) {
      Swal.fire("No selection", "Select at least one record", "warning");
      return;
    }

    Swal.fire({
      title: "Reject selected timesheets?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject"
    }).then(result => {
      if (result.isConfirmed) {
        const ids = selected.map(x => x.timesheetId);
        const comments = selected.map(x => x.comments || '').join(', ');
        this.timesheetService.rejectTimesheets(ids, comments).subscribe(() => {
          Swal.fire("Rejected!", "Timesheets rejected successfully.", "success");
          selected.forEach(ts => {
            ts.status = "Rejected";
            ts.selected = false;
          });
          this.selectAll = false;
        });
      }
    });
  }

  // ================= APPROVE / REJECT FROM MODAL =================
  approveFromPopup() {
    if (!this.selectedTimesheet) return;

    Swal.fire({
      title: "Approve this timesheet?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve"
    }).then(result => {
      if (result.isConfirmed) {
        this.timesheetService.approveTimesheets(
          [this.selectedTimesheet.timesheetId],
          this.selectedTimesheet.comments || ''
        ).subscribe(() => {
          Swal.fire("Approved!", "Timesheet approved.", "success");
          this.selectedTimesheet.status = "Approved";
          const row = this.timesheetList.find(x => x.timesheetId === this.selectedTimesheet.timesheetId);
          if (row) row.status = "Approved";
        });
      }
    });
  }

  rejectFromPopup() {
    if (!this.selectedTimesheet) return;

    Swal.fire({
      title: "Reject this timesheet?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject"
    }).then(result => {
      if (result.isConfirmed) {
        this.timesheetService.rejectTimesheets(
          [this.selectedTimesheet.timesheetId],
          this.selectedTimesheet.comments || ''
        ).subscribe(() => {
          Swal.fire("Rejected!", "Timesheet rejected.", "success");
          this.selectedTimesheet.status = "Rejected";
          const row = this.timesheetList.find(x => x.timesheetId === this.selectedTimesheet.timesheetId);
          if (row) row.status = "Rejected";
        });
      }
    });
  }

  // ================== SORTING ==================
  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortedTimesheets() {
    let data = [...this.timesheetList];
    if (this.sortColumn) {
      data.sort((a, b) => {
        let valA = a[this.sortColumn!];
        let valB = b[this.sortColumn!];

        if (valA instanceof Date) valA = valA.getTime();
        if (valB instanceof Date) valB = valB.getTime();

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }

  // ================== PAGINATION ==================
  filteredTimesheets() {
    const sorted = this.getSortedTimesheets();
    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.timesheetList.length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }
}