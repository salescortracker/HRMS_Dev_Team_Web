import { Component } from '@angular/core';
import { LeaveService } from '../services/leave.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-leave-approvals',
  standalone: false,
  templateUrl: './leave-approvals.component.html',
  styleUrl: './leave-approvals.component.css'
})
export class LeaveApprovalsComponent {
selectAll = false;
  selectedLeave: any = null;
  leaveList: any[] = [];

  // Sorting
sortColumn: keyof any | null = null;
sortDirection: 'asc' | 'desc' = 'asc';

// Pagination
pageSize = 5;
currentPage = 1;
pageSizeOptions = [5, 10, 20, 50];

  managerId!: number;

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.managerId = Number(sessionStorage.getItem("UserId")); // Logged in manager
    this.loadLeaves();
  }

  loadLeaves() {
    this.leaveService.getLeavesForManager(this.managerId).subscribe({
      next: (data) => {
        this.leaveList = data.map(x => ({
          id: x.leaveRequestId,
          employeeName: x.employeeName,
          leaveType: x.leaveTypeName,
          from: x.startDate,
          to: x.endDate,
          days: x.totalDays,
          reason: x.reason,
          status: x.status,
          selected: false
        }));
      }
    });
  }

  toggleSelectAll() {
    this.leaveList.forEach(l => l.selected = this.selectAll);
  }

  sortBy(column: keyof any): void {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }
}

getSortedLeaves(): any[] {
  let data = [...this.leaveList];

  if (this.sortColumn) {
    data.sort((a, b) => {
      const valA = (a[this.sortColumn!] ?? '') as any;
      const valB = (b[this.sortColumn!] ?? '') as any;

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return data;
}

paginatedLeaves(): any[] {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  return this.getSortedLeaves().slice(startIndex, startIndex + this.pageSize);
}

get totalPages(): number {
  return Math.ceil(this.leaveList.length / this.pageSize);
}

changePage(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }
}

changePageSize(size: number): void {
  this.pageSize = size;
  this.currentPage = 1;
}


  checkSelectAll() {
    this.selectAll = this.leaveList.every(l => l.selected);
  }

  
 approveSelected() {
  const ids = this.leaveList.filter(l => l.selected).map(l => l.id);
  if (ids.length === 0) {
      Swal.fire("No selection", "Please select at least one record", "warning");
      return;
    }
    Swal.fire({
      title: "Approve selected leaves?",
      text: `${ids.length} leave(s) will be approved.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel"
    }).then(result => {
      if (result.isConfirmed) {

  this.leaveService.bulkApprove(ids).subscribe({
    next: () => {
      this.leaveList = this.leaveList.map(l => 
        l.selected ? { ...l, status: 'Approved', selected: false } : l
      );
      this.selectAll = false;
      Swal.fire("Approved!", "Selected leaves approved.", "success");
    }
  });
}
});
  }

rejectSelected() {
    const ids = this.leaveList.filter(l => l.selected).map(l => l.id);
    if (ids.length === 0) {
      Swal.fire("No selection", "Please select at least one record", "warning");
      return;
    }

    Swal.fire({
      title: "Reject selected leaves?",
      text: `${ids.length} leave(s) will be rejected.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Reject",
      cancelButtonText: "Cancel"
    }).then(result => {
      if (result.isConfirmed) {
        this.leaveService.bulkReject(ids).subscribe({
          next: () => {
            this.leaveList = this.leaveList.map(l =>
              l.selected ? { ...l, status: 'Rejected', selected: false } : l
            );
            this.selectAll = false;

            Swal.fire("Rejected!", "Selected leaves rejected.", "success");
          }
        });
      }
    });
  }


  openViewModal(leave: any) {
    this.selectedLeave = leave;
  }

  updateStatus(status: string) {
    if (this.selectedLeave) {
      this.selectedLeave.status = status;
    }
  }
 approveFromPopup() {
    Swal.fire({
      title: "Approve this leave?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve"
    }).then(result => {
      if (!result.isConfirmed || !this.selectedLeave) return;

      this.leaveService.approveLeave(this.selectedLeave.id).subscribe({
        next: () => {
          this.leaveList = this.leaveList.map(l =>
            l.id === this.selectedLeave.id ? { ...l, status: 'Approved' } : l
          );
          this.selectedLeave.status = "Approved";

          Swal.fire("Approved!", "Leave approved successfully.", "success");
        }
      });
    });
  }

  // ---------------------------------------------------
  // ❌ REJECT FROM POPUP WITH SWEETALERT
  // ---------------------------------------------------
  rejectFromPopup() {
    Swal.fire({
      title: "Reject this leave?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject"
    }).then(result => {
      if (!result.isConfirmed || !this.selectedLeave) return;

      this.leaveService.rejectLeave(this.selectedLeave.id).subscribe({
        next: () => {
          this.leaveList = this.leaveList.map(l =>
            l.id === this.selectedLeave.id ? { ...l, status: 'Rejected' } : l
          );
          this.selectedLeave.status = "Rejected";

          Swal.fire("Rejected!", "Leave rejected successfully.", "success");
        }
      });
    });
  }

}
