import { Component, OnInit } from '@angular/core';
import { AdminService, KpiCategory } from '../../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-kpi-category',
  standalone: false,
  templateUrl: './kpi-category.component.html',
  styleUrl: './kpi-category.component.css'
})
export class KpiCategoryComponent {

  kpi: KpiCategory = this.getEmptyKpi();
  kpiList: KpiCategory[] = [];

  isEditMode = false;
  showUploadPopup = false;

  searchText = '';
  statusFilter: boolean | '' = '';

  pageSize = 5;
  currentPage = 1;

  sortColumn = 'KpiCategoryID';
  sortDirection: 'asc' | 'desc' = 'desc';

  companyId = 1;
  regionId = 1;

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadKpiCategories();
  }

  // --------------------------
  // Empty Model
  // --------------------------
  getEmptyKpi(): KpiCategory {
    return {
      KpiCategoryID: 0,
      KpiCategoryName: '',
     
      IsActive: true,
      CompanyID: this.companyId,
      RegionID: this.regionId
    };
  }

  // --------------------------
  // Load
  // --------------------------
  loadKpiCategories(): void {
    this.spinner.show();

    this.adminService.getKpiCategories(this.companyId, this.regionId).subscribe({
      next: (res: any) => {
        this.kpiList = res.data?.data || res;
        this.kpiList.sort((a: any, b: any) => b.KpiCategoryID - a.KpiCategoryID);
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load KPI Category data.', 'error');
      }
    });
  }

  // --------------------------
  // Create + Update
  // --------------------------
  onSubmit(): void {
    this.spinner.show();

    if (this.isEditMode) {
      this.adminService.updateKpiCategory(this.kpi).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Updated', `${this.kpi.KpiCategoryName} updated successfully!`, 'success');
          this.loadKpiCategories();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Update failed.', 'error');
        }
      });
    } else {
      this.adminService.createKpiCategory(this.kpi).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Added', `${this.kpi.KpiCategoryName} added successfully!`, 'success');
          this.loadKpiCategories();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Create failed.', 'error');
        }
      });
    }
  }

  // --------------------------
  // Edit
  // --------------------------
  editKpi(k: KpiCategory): void {
    this.kpi = { ...k };
    this.isEditMode = true;
  }

  // --------------------------
  // Delete
  // --------------------------
  deleteKpi(k: KpiCategory): void {
    Swal.fire({
      title: `Are you sure you want to delete ${k.KpiCategoryName}?`,
      showDenyButton: true,
      confirmButtonText: 'Confirm'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteKpiCategory(k.KpiCategoryID!).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted', `${k.KpiCategoryName} deleted successfully.`, 'success');
            this.loadKpiCategories();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed.', 'error');
          }
        });
      }
    });
  }

  // --------------------------
  // Reset Form
  // --------------------------
  resetForm(): void {
    this.kpi = this.getEmptyKpi();
    this.isEditMode = false;
  }

  // --------------------------
  // Filter
  // --------------------------
  filteredKpiList(): KpiCategory[] {
    const search = this.searchText.toLowerCase();
    return this.kpiList.filter(k => {
      const matchSearch = k.KpiCategoryName.toLowerCase().includes(search);
      const matchStatus = this.statusFilter === '' || k.IsActive === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  // --------------------------
  // Pagination
  // --------------------------

  goToPage(pg: number): void {
    this.currentPage = pg;
  }

  // --------------------------
  // Sorting
  // --------------------------
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
    this.kpiList.sort((a: any, b: any) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(col: string): string {
    if (this.sortColumn !== col) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  get pagedKpiList(): KpiCategory[] {
    const sorted = [...this.filteredKpiList()];
    this.applySorting();
    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  // --------------------------
  // Excel & PDF Export
  // --------------------------
  exportAs(type: 'excel' | 'pdf'): void {
    if (type === 'excel') this.exportExcel();
    else this.exportPDF();
  }

  exportExcel(): void {
    const exportData = this.kpiList.map(k => ({
      'KPI Category': k.KpiCategoryName,
    
      'Status': k.IsActive ? 'Active' : 'Inactive'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'KPI Category');
    XLSX.writeFile(wb, 'KpiCategoryList.xlsx');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    const data = this.kpiList.map(k => [
      k.KpiCategoryName,     
      k.IsActive ? 'Active' : 'Inactive'
    ]);

    autoTable(doc, {
      head: [['KPI Category', 'Description', 'Status']],
      body: data
    });

    doc.save('KpiCategoryList.pdf');
  }

  // --------------------------
  // Bulk Upload
  // --------------------------
  onBulkUploadComplete(data: any): void {
    if (data && data.length > 0) {
      this.adminService.bulkInsertData('KpiCategory', data).subscribe({
        next: () => {
          Swal.fire('Success', 'KPI Category data uploaded successfully!', 'success');
          this.loadKpiCategories();
          this.closeUploadPopup();
        },
        error: () =>
          Swal.fire('Error', 'Failed to upload KPI Category data.', 'error')
      });
    } else {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
    }
  }
// ----------------------------------------
// Pagination Helpers
// ----------------------------------------

changePage(page: number): void {
  if (page < 1 || page > this.totalPages()) return;
  this.currentPage = page;
}
totalPages(): number {
  return Math.ceil(this.filteredKpis().length / this.pageSize);
}
pagesArray(): number[] {
  return Array(this.totalPages())
    .fill(0)
    .map((x, i) => i + 1);
}

filteredKpis() {
  const search = this.searchText?.toLowerCase() || '';

  return this.kpiList.filter(k =>
    k.KpiCategoryName?.toLowerCase().includes(search)
  );
}

paginatedKpis(): any[] {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.filteredKpis().slice(start, start + this.pageSize);
}
  openUploadPopup() {
    this.showUploadPopup = false;
    setTimeout(() => (this.showUploadPopup = true), 0);
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
  }
}
