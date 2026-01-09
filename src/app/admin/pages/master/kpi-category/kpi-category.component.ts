import { Component, OnInit } from '@angular/core';
import { AdminService, Company, KpiCategory, Region } from '../../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// Extend backend KpiCategory to include display fields
export interface KpiCategoryView extends KpiCategory {
  companyName: string;
  regionName: string;
}
@Component({
  selector: 'app-kpi-category',
  standalone: false,
  templateUrl: './kpi-category.component.html',
  styleUrl: './kpi-category.component.css'
})
export class KpiCategoryComponent implements OnInit {
  kpiList: KpiCategoryView[] = [];
  kpi!: KpiCategoryView;

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';

  pageSize = 5;
  currentPage = 1;

  sortColumn = 'KpiCategoryID';
  sortDirection: 'asc' | 'desc' = 'desc';

  showUploadPopup = false;

  companyMap: { [key: number]: string } = {};
  regionMap: { [key: number]: string } = {};

  companies: Company[] = [];
  regions: Region[] = [];

  companyId: number = +(sessionStorage.getItem('CompanyId') || 0);
  regionId: number = +(sessionStorage.getItem('RegionId') || 0);

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.kpi = this.getEmptyKpi();
    this.companyId = this.kpi.CompanyID || 0;
    this.regionId = this.kpi.RegionID || 0;

    this.loadCompanies();
  }

  getEmptyKpi(): KpiCategoryView {
    return {
      KpiCategoryID: 0,
      KpiCategoryName: '',
      Description: '',
      IsActive: true,
      CompanyID: this.companyId,
      RegionID: this.regionId,
      companyName: this.companyMap[this.companyId] || '',
      regionName: this.regionMap[this.regionId] || ''
    };
  }

  // ================= LOAD COMPANIES & REGIONS =================
  loadCompanies(): void {
    this.adminService.getCompanies().subscribe({
      next: res => {
        this.companies = res || [];
        this.companyMap = {};
        this.companies.forEach(c => (this.companyMap[c.companyId] = c.companyName));

        if (this.companyId) {
          this.loadRegions();
        } else {
          this.loadKpis();
        }
      },
      error: () => Swal.fire('Error', 'Failed to load companies', 'error')
    });
  }

  loadRegions(): void {
    if (!this.companyId) {
      this.regions = [];
      this.regionMap = {};
      this.loadKpis();
      return;
    }

    this.adminService.getRegions(this.companyId).subscribe({
      next: res => {
        this.regions = res || [];
        this.regionMap = {};
        this.regions.forEach(r => (this.regionMap[r.regionID] = r.regionName));

        if (!this.regions.find(r => r.regionID === this.regionId)) {
          this.regionId = this.regions.length > 0 ? this.regions[0].regionID : 0;
        }
        this.kpi.RegionID = this.regionId;

        this.loadKpis();
      },
      error: () => Swal.fire('Error', 'Failed to load regions', 'error')
    });
  }

  onCompanyChange(): void {
    sessionStorage.setItem('CompanyId', this.companyId.toString());
    this.regionId = 0;
    this.kpi.RegionID = 0;
    this.regions = [];
    this.regionMap = {};
    this.kpi.CompanyID = this.companyId;
    this.loadRegions();
  }

  onRegionChange(): void {
    sessionStorage.setItem('RegionId', this.regionId.toString());
    this.kpi.RegionID = this.regionId;
    this.loadKpis();
  }

  // ================= LOAD KPI CATEGORIES =================
  loadKpis(): void {
    this.spinner.show();
    this.adminService.getKpiCategories().subscribe({
      next: (res: any) => {
        const data = res.data || [];
        this.kpiList = data.map((k: any) => ({
          KpiCategoryID: k.kpiCategoryID,
          KpiCategoryName: k.kpiCategoryName,
          Description: k.description,
          IsActive: k.isActive,
          CompanyID: k.companyID,
          RegionID: k.regionID,
          companyName: this.companyMap[k.companyID] || '—',
          regionName: this.regionMap[k.regionID] || '—'
        }));
        this.currentPage = 1;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load KPI categories', 'error');
      }
    });
  }

  // ================= SAVE =================
  onSubmit(): void {
    this.kpi.CompanyID = this.companyId;
    this.kpi.RegionID = this.regionId;

    this.spinner.show();
    const obs = this.isEditMode
      ? this.adminService.updateKpiCategory(this.kpi)
      : this.adminService.createKpiCategory(this.kpi);

    obs.subscribe({
      next: () => {
        this.spinner.hide();
        Swal.fire(
          this.isEditMode ? 'Updated!' : 'Created!',
          `KPI Category ${this.isEditMode ? 'updated' : 'created'} successfully.`,
          'success'
        );
        this.resetForm();
        this.loadKpis();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Save failed', 'error');
      }
    });
  }

  editKpi(k: KpiCategoryView): void {
    this.kpi = { ...k };
    this.isEditMode = true;

    this.companyId = k.CompanyID;
    this.regionId = k.RegionID;

    this.loadRegions();
  }

  deleteKpi(k: KpiCategoryView): void {
    Swal.fire({
      title: `Delete "${k.KpiCategoryName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(res => {
      if (res.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteKpiCategory(k.KpiCategoryID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted!', 'KPI Category deleted.', 'success');
            this.resetForm();
            this.loadKpis();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed', 'error');
          }
        });
      }
    });
  }

  resetForm(): void {
    this.kpi = this.getEmptyKpi();
    this.isEditMode = false;
    this.companyId = this.kpi.CompanyID || 0;
    this.regionId = this.kpi.RegionID || 0;

    if (this.companyId) {
      this.loadRegions();
    } else {
      this.regions = [];
      this.regionMap = {};
    }
  }

  // ================= FILTER / SORT / PAGINATION =================
  filteredKpis(): KpiCategoryView[] {
    const search = this.searchText.toLowerCase();
    return this.kpiList.filter(
      k =>
        k.KpiCategoryName.toLowerCase().includes(search) &&
        (this.statusFilter === '' || k.IsActive === this.statusFilter)
    );
  }

  get pagedKpis(): KpiCategoryView[] {
    const filtered = this.filteredKpis();
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredKpis().length / this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  sortTable(column: string): void {
    if (this.sortColumn === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else this.sortColumn = column;
    this.kpiList.sort((a: any, b: any) => {
      const valA = a[column], valB = b[column];
      return valA < valB ? (this.sortDirection === 'asc' ? -1 : 1) : valA > valB ? (this.sortDirection === 'asc' ? 1 : -1) : 0;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // ================= EXPORT =================
  exportAs(type: 'excel' | 'pdf'): void {
    type === 'excel' ? this.exportExcel() : this.exportPDF();
  }

  exportExcel(): void {
    const data = this.filteredKpis().map(k => ({
      'KPI Category': k.KpiCategoryName,
      'Company': k.companyName,
      'Region': k.regionName,
      'Status': k.IsActive ? 'Active' : 'Inactive'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'KPI Categories');
    XLSX.writeFile(wb, 'KpiCategoryList.xlsx');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    const data = this.filteredKpis().map(k => [k.KpiCategoryName, k.companyName, k.regionName, k.IsActive ? 'Active' : 'Inactive']);
    autoTable(doc, { head: [['KPI Category', 'Company', 'Region', 'Status']], body: data });
    doc.save('KpiCategoryList.pdf');
  }

  // ================= BULK UPLOAD =================
  openUploadPopup(): void { this.showUploadPopup = true; }
  closeUploadPopup(): void { this.showUploadPopup = false; }
  onBulkUploadComplete(event: any): void {
    this.showUploadPopup = false;
    this.loadKpis();
  }
}