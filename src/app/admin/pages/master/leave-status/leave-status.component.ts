import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService,LeaveStatus } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-leave-status',
  standalone: false,
  templateUrl: './leave-status.component.html',
  styleUrl: './leave-status.component.css'
})
export class LeaveStatusComponent {
  companyId = 1;
  regionId = 1;

  leave: LeaveStatus = this.getEmptyLeave();
  leaveList: LeaveStatus[] = [];
  leaveModel: any = {};

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';

  currentPage = 1;
  pageSize = 5;

  sortColumn = 'LeaveStatusID';
  sortDirection: 'asc' | 'desc' = 'desc';

  showUploadPopup = false;

  constructor(private admin: AdminService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.loadLeaveStatus();
  }

  /** Default new record */
  getEmptyLeave(): LeaveStatus {
    return {
      LeaveStatusID: 0,
      LeaveStatusName: '',
      IsActive: true,
      CompanyID: this.companyId,
      RegionID: this.regionId
    };
  }

  /** Load Data */
  loadLeaveStatus(): void {
    this.spinner.show();
    this.admin.getLeaveStatus(this.companyId, this.regionId).subscribe({
      next: res => {
        this.leaveList = res.data?.data || res;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Leave Status.', 'error');
      }
    });
  }

  /** Submit Create / Update */
  onSubmit(): void {
    this.spinner.show();
    if (this.isEditMode) {
      this.admin.updateLeaveStatus(this.leave).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Updated', 'Leave Status updated successfully!', 'success');
          this.loadLeaveStatus();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Update failed.', 'error');
        }
      });
    } else {
      this.admin.createLeaveStatus(this.leave).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Created', 'Leave Status created successfully!', 'success');
          this.loadLeaveStatus();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Create failed.', 'error');
        }
      });
    }
  }

  /** Edit */
  editLeave(item: LeaveStatus): void {
    this.leave = { ...item };
    this.isEditMode = true;
  }

  /** Delete */
  deleteLeave(item: LeaveStatus): void {
    Swal.fire({
      title: `Delete "${item.LeaveStatusName}"?`,
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.admin.deleteLeaveStatus(item.LeaveStatusID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted', 'Leave Status deleted successfully.', 'success');
            this.loadLeaveStatus();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed.', 'error');
          }
        });
      }
    });
  }

  /** Reset form */
  resetForm(): void {
    this.leave = this.getEmptyLeave();
    this.isEditMode = false;
  }

  /** Filtered Data */
  filteredLeave(): LeaveStatus[] {
    return this.leaveList.filter(c => {
      const matchSearch = c.LeaveStatusName.toLowerCase().includes(this.searchText.toLowerCase());
      const matchStatus = this.statusFilter === '' || c.IsActive === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  /** Sorting */
  sortTable(column: string) {
    if (this.sortColumn === column)
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  /** Pagination + Sorted List */
  get pagedLeave(): LeaveStatus[] {
    const filtered = this.filteredLeave();

    filtered.sort((a: any, b: any) => {
      const valA = a[this.sortColumn]?.toString().toLowerCase() || '';
      const valB = b[this.sortColumn]?.toString().toLowerCase() || '';

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredLeave().length / this.pageSize) || 1;
  }

  goToPage(page: number): void {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  /** Export */
  exportAs(type: 'excel' | 'pdf') {
    type === 'excel' ? this.exportExcel() : this.exportPDF();
  }

  exportExcel() {
    const data = this.leaveList.map(c => ({
      'Leave Status Name': c.LeaveStatusName,
      'Active': c.IsActive ? 'Yes' : 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Status');
    XLSX.writeFile(wb, 'LeaveStatus.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const data = this.leaveList.map(c => [c.LeaveStatusName, c.IsActive ? 'Yes' : 'No']);
    autoTable(doc, { head: [['Leave Status Name', 'Active']], body: data });
    doc.save('LeaveStatus.pdf');
  }

  /** Bulk Upload */
  openUploadPopup() { this.showUploadPopup = true; }
  closeUploadPopup() { this.showUploadPopup = false; }

  onBulkUploadComplete(data: any): void {
    if (!data || !data.length) {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
      return;
    }

    this.admin.bulkInsertData('LeaveStatus', data).subscribe({
      next: () => {
        Swal.fire('Success', 'Leave Status uploaded successfully!', 'success');
        this.loadLeaveStatus();
        this.closeUploadPopup();
      },
      error: () => Swal.fire('Error', 'Failed to upload data.', 'error')
    });
  }

}
