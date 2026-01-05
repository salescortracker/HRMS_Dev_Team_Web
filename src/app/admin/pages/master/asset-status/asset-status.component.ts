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

  companyId!: number;
  regionId!: number;

  status!: AssetStatus;
  statuses: AssetStatus[] = [];
  statusesModel: any = {}; // for bulk upload

  isEditMode = false;

  searchText = '';
  statusFilter: boolean | '' = '';

  currentPage = 1;
  pageSize = 5;

  sortColumn: keyof AssetStatus = 'assetStatusName';
  sortDirection: 'asc' | 'desc' = 'asc';

  showUploadPopup = false;

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}
ngOnInit(): void {
  this.loadSessionData();
  this.resetForm();
  this.loadStatuses();

  // Initialize bulk upload model
 this.statusesModel = {
  companyId: this.companyId,
  companyName: sessionStorage.getItem('CompanyName') || '', // <- add this
  regionId: this.regionId
};

}


  /* ================= SESSION ================= */

  private loadSessionData(): void {
    this.companyId = Number(sessionStorage.getItem('CompanyId')) || 0;
    this.regionId = Number(sessionStorage.getItem('RegionId')) || 0;
  }

  /* ================= MODEL ================= */

  private getEmptyStatus(): AssetStatus {
    return {
      assetStatusId: 0,
      assetStatusName: '',
      description: '',
      isActive: true,
      companyId: this.companyId,
      regionId: this.regionId
    };
  }

  /* ================= LOAD ================= */

  loadStatuses(): void {
    if (!this.companyId || !this.regionId) return;

    this.spinner.show();
    this.adminService.getAssetStatuses(this.companyId, this.regionId).subscribe({
      next: res => {
        this.statuses = res;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Asset Statuses.', 'error');
      }
    });
  }

  /* ================= SAVE / UPDATE ================= */

  onSubmit(): void {
    this.isEditMode ? this.updateStatus() : this.createStatus();
  }

  private createStatus(): void {
    this.spinner.show();
    this.adminService.createAssetStatus(this.status).subscribe({
      next: () => {
        Swal.fire('Saved!', 'Asset Status created successfully.', 'success');
        this.loadStatuses();
        this.resetForm();
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to create status.', 'error');
      }
    });
  }

  private updateStatus(): void {
    this.spinner.show();
    this.adminService.updateAssetStatus(this.status).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Asset Status updated successfully.', 'success');
        this.loadStatuses();
        this.resetForm();
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to update status.', 'error');
      }
    });
  }

  /* ================= EDIT ================= */

  editStatus(s: AssetStatus): void {
    this.status = { ...s };
    this.isEditMode = true;
  }

  /* ================= DELETE ================= */

  deleteStatus(s: AssetStatus): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${s.assetStatusName}"?`,
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteAssetStatus(s.assetStatusId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Asset Status deleted successfully.', 'success');
            this.loadStatuses();
            this.spinner.hide();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Failed to delete status.', 'error');
          }
        });
      }
    });
  }

  /* ================= RESET ================= */

  resetForm(): void {
    this.status = this.getEmptyStatus();
    this.isEditMode = false;
  }

  /* ================= FILTER ================= */

  filteredStatuses(): AssetStatus[] {
    return this.statuses.filter(s => {
      const searchMatch =
        s.assetStatusName.toLowerCase().includes(this.searchText.toLowerCase());

      const statusMatch =
        this.statusFilter === '' || s.isActive === this.statusFilter;

      return searchMatch && statusMatch;
    });
  }

  /* ================= SORT ================= */

  sortTable(column: keyof AssetStatus): void {
    this.sortDirection =
      this.sortColumn === column && this.sortDirection === 'asc'
        ? 'desc'
        : 'asc';
    this.sortColumn = column;
  }

  /* ================= PAGINATION ================= */

  get pagedStatuses(): AssetStatus[] {
    const sorted = [...this.filteredStatuses()].sort((a, b) => {
      const valA = String(a[this.sortColumn]).toLowerCase();
      const valB = String(b[this.sortColumn]).toLowerCase();
      return this.sortDirection === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredStatuses().length / this.pageSize) || 1;
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
  }

  /* ================= BULK UPLOAD ================= */

  openUploadPopup(): void {
    this.showUploadPopup = true;
  }

  closeUploadPopup(): void {
    this.showUploadPopup = false;
  }

  onBulkUploadComplete(event: any): void {
    this.showUploadPopup = false;
    Swal.fire('Success', 'Bulk upload completed successfully.', 'success');
    this.loadStatuses();
  }

  /* ================= EXPORT ================= */

  exportExcel(): void {
    const data = this.statuses.map(s => ({
      'Asset Status': s.assetStatusName,
      'Description': s.description,
      'Active': s.isActive ? 'Yes' : 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'AssetStatuses');
    XLSX.writeFile(wb, 'AssetStatuses.xlsx');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Asset Status', 'Description', 'Active']],
      body: this.statuses.map(s => [
        s.assetStatusName,
        s.description,
        s.isActive ? 'Yes' : 'No'
      ])
    });
    doc.save('AssetStatuses.pdf');
  }
}
