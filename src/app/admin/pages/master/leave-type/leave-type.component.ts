import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService,User,Department ,LeaveType } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-leave-type',
  standalone: false,
  templateUrl: './leave-type.component.html',
  styleUrl: './leave-type.component.css'
})
export class LeaveTypeComponent implements OnInit {
  
  
  companies: any[] = [];
  regions: any[] = [];

  // Form Model
  leave: any = this.getEmptyLeaveType();
  leaveTypeList: LeaveType[] = [];
  leaveTypeModel: any = {};

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';

  currentPage = 1;
  pageSize = 5;

  sortColumn = 'LeaveTypeID';
  sortDirection: 'asc' | 'desc' = 'asc';

  showUploadPopup = false;

  constructor(private admin: AdminService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.loadLeaveType();
    this.loadCompanies();
    this.loadRegions();

}

  getEmptyLeaveType(): LeaveType {
    return {
      LeaveTypeId: 0,
      LeaveTypeName: '',
      LeaveDays: 1,
      IsActive: true,
      CompanyID: 0,
      RegionID: 0,
    };
  }


  loadCompanies(): void {
    this.admin.getCompanies().subscribe({
          next: (res:any) => (this.companies = res),
          error: () => Swal.fire('Error', 'Failed to load companies.', 'error')
        });
  }
  

    loadRegions(): void {
    this.admin.getRegions().subscribe({
          next: (res:any) => (this.regions = res),
          error: () => Swal.fire('Error', 'Failed to load regions.', 'error')
        });
  }

  
  loadLeaveType(): void {
    this.spinner.show();
    this.admin.getLeaveType(this.leave.companyId, this.leave.regionId).subscribe({
      next: res => {
        this.leaveTypeList = res.data?.data || res;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Leave Type.', 'error');
      }
    });
  }

  onSubmit(): void {
    this.spinner.show();

    if (this.isEditMode) {
      this.admin.updateLeaveType(this.leave).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Updated', 'Leave Type updated successfully!', 'success');
          this.loadLeaveType();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Update failed.', 'error');
        }
      });
    } else {
      this.admin.createLeaveType(this.leave).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Created', 'Leave Type created successfully!', 'success');
          this.loadLeaveType();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Create failed.', 'error');
        }
      });
    }
  }

  editLeaveType(item: LeaveType): void {
    this.leave = { ...item };
    this.isEditMode = true;
  }

  deleteLeaveType(item: LeaveType): void {
    Swal.fire({
      title: `Delete "${item.LeaveTypeName}"?`,
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.admin.deleteLeaveType(item.LeaveTypeId).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted', 'Leave Type deleted successfully.', 'success');
            this.loadLeaveType();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed.', 'error');
          }
        });
      }
    });
  }

  resetForm(): void {
    this.leave = this.getEmptyLeaveType();
    this.isEditMode = false;
  }

  filteredLeaveType(): LeaveType[] {
    return this.leaveTypeList.filter(c => {
      const matchSearch =
        c.LeaveTypeName.toLowerCase().includes(this.searchText.toLowerCase());

      const matchStatus = this.statusFilter === '' || c.IsActive === this.statusFilter;

      return matchSearch && matchStatus;
    });
  }

  sortTable(column: string) {
    if (this.sortColumn === column)
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  get pagedLeaveType(): LeaveType[] {
    const filtered = this.filteredLeaveType();

    filtered.sort((a: any, b: any) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];

      return this.sortDirection === 'asc'
        ? valA < valB ? -1 : 1
        : valA > valB ? -1 : 1;
    });

    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredLeaveType().length / this.pageSize) || 1;
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

  exportAs(type: 'excel' | 'pdf') {
    type === 'excel' ? this.exportExcel() : this.exportPDF();
  }

  exportExcel() {
    const data = this.leaveTypeList.map(c => ({
      'Leave Type Name': c.LeaveTypeName,
      'Days': c.LeaveDays,
      'Active': c.IsActive ? 'Yes' : 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Type');
    XLSX.writeFile(wb, 'LeaveType.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const data = this.leaveTypeList.map(c => [
      c.LeaveTypeName,
      c.LeaveDays,
      c.IsActive ? 'Yes' : 'No'
    ]);

    autoTable(doc, {
      head: [['Leave Type Name', 'Days', 'Active']],
      body: data
    });

    doc.save('LeaveType.pdf');
  }

  openUploadPopup() {
    this.showUploadPopup = true;
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
  }

  onBulkUploadComplete(data: any): void {
    if (!data || !data.length) {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
      return;
    }

    this.admin.bulkInsertData('LeaveType', data).subscribe({
      next: () => {
        Swal.fire('Success', 'Leave Type uploaded successfully!', 'success');
        this.loadLeaveType();
        this.closeUploadPopup();
      },
      error: () => Swal.fire('Error', 'Failed to upload data.', 'error')
    });
  }
}
function loadRegions(): ((error: any) => void) | null | undefined {
  throw new Error('Function not implemented.');
}

