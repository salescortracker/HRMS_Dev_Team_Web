import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService, AttendanceStatus } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-attendance-status',
  standalone: false,
  templateUrl: './attendance-status.component.html',
  styleUrl: './attendance-status.component.css'
})
export class AttendanceStatusComponent {

  companyId = 1;
  regionId = 1;

  attendance: AttendanceStatus = this.getEmptyAttendance();
  attendanceList: AttendanceStatus[] = [];
  attendanceModel: any = {};

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';

  currentPage = 1;
  pageSize = 5;

  sortColumn = 'AttendanceStatusID';
  sortDirection: 'asc' | 'desc' = 'desc';

  showUploadPopup = false;

  constructor(private admin: AdminService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.loadAttendanceStatus();
  }

  /** Default new record */
  getEmptyAttendance(): AttendanceStatus {
    return {
      AttendanceStatusID: 0,
      AttendanceStatusName: '',
      IsActive: true,
      CompanyID: this.companyId,
      RegionID: this.regionId
    };
  }

  /** Load Data */
  loadAttendanceStatus(): void {
    this.spinner.show();
    this.admin.getAttendanceStatus(this.companyId, this.regionId).subscribe({
      next: res => {
        this.attendanceList = res.data?.data || res;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Attendance Status.', 'error');
      }
    });
  }

  /** Submit Create / Update */
  onSubmit(): void {
    this.spinner.show();
    if (this.isEditMode) {
      this.admin.updateAttendanceStatus(this.attendance).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Updated', 'Attendance Status updated successfully!', 'success');
          this.loadAttendanceStatus();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Update failed.', 'error');
        }
      });
    } else {
      this.admin.createAttendanceStatus(this.attendance).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Created', 'Attendance Status created successfully!', 'success');
          this.loadAttendanceStatus();
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
  editAttendance(item: AttendanceStatus): void {
    this.attendance = { ...item };
    this.isEditMode = true;
  }

  /** Delete */
  deleteAttendance(item: AttendanceStatus): void {
    Swal.fire({
      title: `Delete "${item.AttendanceStatusName}"?`,
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.admin.deleteAttendanceStatus(item.AttendanceStatusID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted', 'Attendance Status deleted successfully.', 'success');
            this.loadAttendanceStatus();
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
    this.attendance = this.getEmptyAttendance();
    this.isEditMode = false;
  }

  /** Filtered Data */
  filteredAttendance(): AttendanceStatus[] {
    return this.attendanceList.filter(c => {
      const matchSearch = c.AttendanceStatusName.toLowerCase().includes(this.searchText.toLowerCase());
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
  get pagedAttendance(): AttendanceStatus[] {
    const filtered = this.filteredAttendance();

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
    return Math.ceil(this.filteredAttendance().length / this.pageSize) || 1;
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
    const data = this.attendanceList.map(c => ({
      'Status Name': c.AttendanceStatusName,
      'Active': c.IsActive ? 'Yes' : 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Status');
    XLSX.writeFile(wb, 'AttendanceStatus.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const data = this.attendanceList.map(c => [c.AttendanceStatusName, c.IsActive ? 'Yes' : 'No']);
    autoTable(doc, { head: [['Status Name', 'Active']], body: data });
    doc.save('AttendanceStatus.pdf');
  }

  /** Bulk Upload */
  openUploadPopup() { this.showUploadPopup = true; }
  closeUploadPopup() { this.showUploadPopup = false; }

  onBulkUploadComplete(data: any): void {
    if (!data || !data.length) {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
      return;
    }

    this.admin.bulkInsertData('AttendanceStatus', data).subscribe({
      next: () => {
        Swal.fire('Success', 'Attendance Status uploaded successfully!', 'success');
        this.loadAttendanceStatus();
        this.closeUploadPopup();
      },
      error: () => Swal.fire('Error', 'Failed to upload data.', 'error')
    });
  }
}
