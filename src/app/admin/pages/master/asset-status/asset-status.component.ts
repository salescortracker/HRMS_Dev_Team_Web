import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AssetStatus } from '../../../servies/admin.service';
@Component({
  selector: 'app-asset-status',
  standalone: false,
  templateUrl: './asset-status.component.html',
  styleUrl: './asset-status.component.css'
})
export class AssetStatusComponent {

  companyId = 1;
  regionId = 1;

  status: AssetStatus = this.getEmptyStatus();
  statuses: AssetStatus[] = [];
  statusesModel: any = {};

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  currentPage = 1;
  pageSize = 5;

  sortColumn = 'AssetStatusID';
  sortDirection: 'asc' | 'desc' = 'desc';

  showUploadPopup = false;

  constructor(private adminService: AdminService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.loadStatuses();
  }

  getEmptyStatus(): AssetStatus {
    return {
      AssetStatusID: 0,
      AssetStatusName: '',
      IsActive: true,
      CompanyID: this.companyId,
      RegionID: this.regionId
    };
  }

  loadStatuses(): void {
    this.spinner.show();
    this.adminService.getAssetStatuses(this.companyId, this.regionId).subscribe({
      next: res => {
        this.statuses = res.data?.data || res;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Asset Statuses.', 'error');
      }
    });
  }

  onSubmit(): void {
    this.spinner.show();
    if (this.isEditMode) {
      this.adminService.updateAssetStatus(this.status).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Updated', `${this.status.AssetStatusName} updated successfully!`, 'success');
          this.loadStatuses();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Update failed.', 'error');
        }
      });
    } else {
      this.adminService.createAssetStatus(this.status).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Created', `${this.status.AssetStatusName} added successfully!`, 'success');
          this.loadStatuses();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Create failed.', 'error');
        }
      });
    }
  }

  editStatus(s: AssetStatus): void {
    this.status = { ...s };
    this.isEditMode = true;
  }

  deleteStatus(s: AssetStatus): void {
    Swal.fire({
      title: `Delete ${s.AssetStatusName}?`,
      showDenyButton: true,
      confirmButtonText: 'Confirm'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteAssetStatus(s.AssetStatusID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted', `${s.AssetStatusName} deleted successfully.`, 'success');
            this.loadStatuses();
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
    this.status = this.getEmptyStatus();
    this.isEditMode = false;
  }

  /** Filtering + Sorting + Pagination */
  filteredStatuses(): AssetStatus[] {
    return this.statuses.filter(s => {
      const matchesSearch = s.AssetStatusName.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.statusFilter === '' || s.IsActive === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  sortTable(column: string) {
    if (this.sortColumn === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else this.sortColumn = column; this.sortDirection = 'asc';
  }

  get pagedStatuses(): AssetStatus[] {
    const filtered = this.filteredStatuses();
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
    return Math.ceil(this.filteredStatuses().length / this.pageSize) || 1;
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
    const data = this.statuses.map(s => ({
      'Asset Status': s.AssetStatusName,
      'Active': s.IsActive ? 'Yes' : 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'AssetStatuses');
    XLSX.writeFile(wb, 'AssetStatuses.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const data = this.statuses.map(s => [s.AssetStatusName, s.IsActive ? 'Yes' : 'No']);
    autoTable(doc, { head: [['Asset Status', 'Active']], body: data });
    doc.save('AssetStatuses.pdf');
  }

  /** Bulk Upload */
  openUploadPopup() { this.showUploadPopup = true; }
  closeUploadPopup() { this.showUploadPopup = false; }

  onBulkUploadComplete(data: any): void {
    if (!data || !data.length) {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
      return;
    }
    this.adminService.bulkInsertData('AssetStatus', data).subscribe({
      next: () => {
        Swal.fire('Success', 'Asset Status data uploaded successfully!', 'success');
        this.loadStatuses();
        this.closeUploadPopup();
      },
      error: () => Swal.fire('Error', 'Failed to upload data.', 'error')
    });
  }
}
