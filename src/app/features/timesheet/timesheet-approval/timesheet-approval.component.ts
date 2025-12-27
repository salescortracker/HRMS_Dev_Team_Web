import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-timesheet-approval',
  standalone: false,
  templateUrl: './timesheet-approval.component.html',
  styleUrl: './timesheet-approval.component.css'
})
export class TimesheetApprovalComponent {
selectAll = false;
  selectedTimesheet: any = null;

  timesheetList = [
    {
      id: 1,
      employeeName: 'John Doe',
      employeeId: 'EMP001',
      project: 'Project A',
      task: 'Development',
      date: '2025-10-15',
      totalHours: 8,
      otHours: 2,
      comments: '',
      status: 'Pending',
      selected: false
    }
  ];

  toggleSelectAll() {
    this.timesheetList.forEach(t => t.selected = this.selectAll);
  }

  checkSelectAll() {
    this.selectAll = this.timesheetList.every(t => t.selected);
  }

  openViewModal(ts: any) {
    this.selectedTimesheet = ts;
  }

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
    }).then(res => {
      if (res.isConfirmed) {
        selected.forEach(t => {
          t.status = 'Approved';
          t.selected = false;
        });
        this.selectAll = false;
        Swal.fire("Approved!", "Timesheets approved.", "success");
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
    }).then(res => {
      if (res.isConfirmed) {
        selected.forEach(t => {
          t.status = 'Rejected';
          t.selected = false;
        });
        this.selectAll = false;
        Swal.fire("Rejected!", "Timesheets rejected.", "success");
      }
    });
  }

  approveFromPopup() {
    if (!this.selectedTimesheet) return;

    Swal.fire({
      title: "Approve this timesheet?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve"
    }).then(res => {
      if (res.isConfirmed) {
        this.selectedTimesheet.status = 'Approved';
        Swal.fire("Approved!", "Timesheet approved.", "success");
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
    }).then(res => {
      if (res.isConfirmed) {
        this.selectedTimesheet.status = 'Rejected';
        Swal.fire("Rejected!", "Timesheet rejected.", "success");
      }
    });
  }
}
