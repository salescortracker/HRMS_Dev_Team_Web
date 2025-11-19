import { Component, OnInit } from '@angular/core';
import { AdminService, MaritalStatus } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-marital-status',
  standalone: false,
  templateUrl: './marital-status.component.html',
  styleUrl: './marital-status.component.css'
})
export class MaritalStatusComponent {
maritalModel: any;
  statuses: MaritalStatus[] = [];
  marital: MaritalStatus = this.getEmptyStatus();
  showUploadPopup = false;
  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  pageSize = 5;
  currentPage = 1;

  sortColumn: string = 'MaritalStatusID';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadStatuses();
  }

  // Empty model
  getEmptyStatus(): MaritalStatus {
    return {
      MaritalStatusID: 0,
      StatusName: '',
      IsActive: true
    };
  }

  // Load statuses
  loadStatuses(): void {
    this.spinner.show();
    this.adminService.getMaritalStatuses().subscribe({
      next: (res: any) => {
        this.statuses = res.data?.data || res;
        this.statuses.sort((a: any, b: any) => b.MaritalStatusID - a.MaritalStatusID);
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Marital Status data.', 'error');
      }
    });
  }

  // Submit
  onSubmit(): void {
    this.spinner.show();
    if (this.isEditMode) {
      this.adminService.updateMaritalStatus(this.marital.MaritalStatusID, this.marital).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Updated', `${this.marital.StatusName} updated successfully!`, 'success');
          this.loadStatuses();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Update failed. Please contact IT Administrator.', 'error');
        }
      });
    } else {
      this.adminService.createMaritalStatus(this.marital).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Added', `${this.marital.StatusName} added successfully!`, 'success');
          this.loadStatuses();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Create failed. Please contact IT Administrator.', 'error');
        }
      });
    }
  }

  editStatus(s: MaritalStatus): void {
    this.marital = { ...s };
    this.isEditMode = true;
  }

  deleteStatus(s: MaritalStatus): void {
    Swal.fire({
      title: `Are you sure you want to delete ${s.StatusName}?`,
      showDenyButton: true,
      confirmButtonText: 'Confirm'
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteMaritalStatus(s.MaritalStatusID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted', `${s.StatusName} deleted successfully.`, 'success');
            this.loadStatuses();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed. Please contact IT Administrator.', 'error');
          }
        });
      }
    });
  }

  resetForm(): void {
    this.marital = this.getEmptyStatus();
    this.isEditMode = false;
  }

  // Filter + Search
  filteredStatuses(): MaritalStatus[] {
    const search = this.searchText.toLowerCase();
    return this.statuses.filter(s => {
      const matchesSearch = s.StatusName.toLowerCase().includes(search);
      const matchesStatus = this.statusFilter === '' || s.IsActive === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.filteredStatuses().length / this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  // Sorting
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  applySorting(): void {
    this.statuses.sort((a: any, b: any) => {
      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // Paginated Data
  get pagedStatuses(): MaritalStatus[] {
    const sorted = [...this.filteredStatuses()];
    this.applySorting();
    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  // Export (Excel / PDF)
  exportAs(type: 'excel' | 'pdf') {
    if (type === 'excel') this.exportExcel();
    else this.exportPDF();
  }

  exportExcel() {
    const exportData = this.statuses.map(s => ({
      'Status Name': s.StatusName,
      'Status': s.IsActive ? 'Active' : 'Inactive'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Marital Status');
    XLSX.writeFile(wb, 'MaritalStatusList.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const exportData = this.statuses.map(s => [
      s.StatusName,
      s.IsActive ? 'Active' : 'Inactive'
    ]);
    autoTable(doc, {
      head: [['Status Name', 'Status']],
      body: exportData
    });
    doc.save('MaritalStatusList.pdf');
  }



  onBulkUploadComplete(data: any): void {
    if (data && data.length > 0) {
      this.adminService.bulkInsertData('MaritalStatus', data).subscribe({
        next: () => {
          Swal.fire('Success', 'Marital Status data uploaded successfully!', 'success');
          this.loadStatuses();
          this.closeUploadPopup();
        },
        error: () => Swal.fire('Error', 'Failed to upload data.', 'error')
      });
    } else {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
    }
  }

  openUploadPopup() {
    this.showUploadPopup = false;
    setTimeout(() => (this.showUploadPopup = true), 0);
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
  }
}
