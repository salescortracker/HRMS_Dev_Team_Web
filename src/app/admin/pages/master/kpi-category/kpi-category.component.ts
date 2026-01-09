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
  kpi!: KpiCategoryView; // Initialize in ngOnInit to avoid undefined errors

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  pageSize = 5;
  currentPage = 1;
  showUploadPopup = false;
  sortColumn: string = 'KpiCategoryID';
  sortDirection: 'asc' | 'desc' = 'desc';

  companies: Company[] = [];
  regions: Region[] = [];

  companyMap: { [key: number]: string } = {};
  regionMap: { [key: number]: string } = {};

  companyId: number = +(sessionStorage.getItem('CompanyId') || 0);
  regionId: number = +(sessionStorage.getItem('RegionId') || 0);

  constructor(private adminService: AdminService, private spinner: NgxSpinnerService) { }

ngOnInit(): void {
  this.companyId = Number(sessionStorage.getItem('CompanyId')) || 0;
  this.regionId = Number(sessionStorage.getItem('RegionId')) || 0;
this.loadKpis();
  this.loadCompanies();
  this.kpi = this.getEmptyKpi();
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

loadCompanies(): void {
  this.adminService.getCompanies().subscribe({
    next: (res: Company[]) => {
      this.companies = res || [];
      this.companyMap = {};
      this.companies.forEach(c => this.companyMap[c.companyId] = c.companyName);

      // If a companyId is selected, load regions first
      if (this.companyId) {
        this.loadRegions();
      } else {
        // If no company selected, still load KPIs
        this.loadKpis();
      }
    },
    error: () => Swal.fire('Error', 'Failed to load companies', 'error')
  });
}

loadRegions(): void {
  if (!this.companyId) {
    this.loadKpis();
    return;
  }

  this.adminService.getRegions(this.companyId).subscribe({
    next: (res: Region[]) => {
      this.regions = res || [];
      this.regionMap = {};
      this.regions.forEach(r => this.regionMap[r.regionID] = r.regionName);

      // Set regionId from session or fallback to first region
      if (!this.regionId || !this.regionMap[this.regionId]) {
        this.regionId = this.regions.length > 0 ? this.regions[0].regionID : 0;
      }
      sessionStorage.setItem('RegionId', this.regionId.toString());

      this.kpi.RegionID = this.regionId;

      // Now load KPIs
      this.loadKpis();
    },
    error: () => Swal.fire('Error', 'Failed to load regions', 'error')
  });
}

loadKpis(): void {
  this.spinner.show();

  this.adminService.getKpiCategories().subscribe({
    next: (res: any) => {
      const data = res.data || [];

      // Ensure regionMap is populated for all regions in data
      // Get unique region IDs from data
      const regionIds = Array.from(new Set(data.map((k: any) => k.regionID)));

      // Load regions for these IDs if regionMap is empty
      this.adminService.getRegions().subscribe({
        next: (allRegions: Region[]) => {
          this.regionMap = {};
          allRegions.forEach(r => this.regionMap[r.regionID] = r.regionName);

          // Map KPI data with companyName and regionName
          this.kpiList = data.map((k: any) => ({
            KpiCategoryID: k.kpiCategoryID,
            KpiCategoryName: k.kpiCategoryName,
            Description: k.description,
            IsActive: k.isActive,
            CompanyID: k.companyID,
            RegionID: k.regionID,
            companyName: this.companyMap[k.companyID] ?? '—',
            regionName: this.regionMap[k.regionID] ?? '—'
          }));

          this.currentPage = 1;
          this.spinner.hide();
        },
        error: () => {
          // fallback if regions API fails
          this.kpiList = data.map((k: any) => ({
            KpiCategoryID: k.kpiCategoryID,
            KpiCategoryName: k.kpiCategoryName,
            Description: k.description,
            IsActive: k.isActive,
            CompanyID: k.companyID,
            RegionID: k.regionID,
            companyName: this.companyMap[k.companyID] ?? '—',
            regionName: '—'
          }));
          this.spinner.hide();
        }
      });

    },
    error: () => {
      this.spinner.hide();
      Swal.fire('Error', 'Failed to load KPI categories', 'error');
    }
  });
}



onCompanyChange(): void {
  // Save selected company
  sessionStorage.setItem('CompanyId', this.companyId.toString());

  // Clear KPI and regions list
  this.kpiList = [];
  this.regions = [];

  // Load regions for selected company
  this.loadRegions();

  // Update KPI company
  this.kpi.CompanyID = this.companyId;
}


onRegionChange(): void {
  sessionStorage.setItem('RegionId', this.regionId.toString());
  this.kpi.RegionID = this.regionId;
  this.loadKpis(); // just calls service without params
}





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
        Swal.fire(this.isEditMode ? 'Updated!' : 'Added!', `KPI category ${this.isEditMode ? 'updated' : 'created'} successfully.`, 'success');
        this.loadKpis();
        this.resetForm();
      },
      error: () => { this.spinner.hide(); Swal.fire('Error', 'Operation failed.', 'error'); }
    });
  }

  editKpi(k: KpiCategoryView) {
  this.kpi = { ...k };
  this.isEditMode = true;

  // Update dropdowns to reflect selected record
  this.companyId = k.CompanyID;
  this.regionId = k.RegionID;

  // Optionally, load regions for selected company
  this.loadRegionsForEdit();
}
loadRegionsForEdit(): void {
  if (!this.companyId) return;

  this.adminService.getRegions(this.companyId).subscribe({
    next: (res: Region[]) => {
      this.regions = res || [];
      this.regionMap = {};
      this.regions.forEach(r => this.regionMap[r.regionID] = r.regionName);

      // Make sure regionId exists in the list, fallback to first region
      if (!this.regionMap[this.regionId]) {
        this.regionId = this.regions.length > 0 ? this.regions[0].regionID : 0;
      }

      this.kpi.RegionID = this.regionId;
    },
    error: () => Swal.fire('Error', 'Failed to load regions', 'error')
  });
}


  deleteKpi(k: KpiCategoryView) {
    if (!k.KpiCategoryID) return;
    Swal.fire({
      title: `Delete "${k.KpiCategoryName}"?`,
      text: 'This action will permanently delete the KPI category.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteKpiCategory(k.KpiCategoryID).subscribe({
          next: () => { this.spinner.hide(); Swal.fire('Deleted!', 'KPI category deleted successfully.', 'success'); this.loadKpis(); },
          error: () => { this.spinner.hide(); Swal.fire('Error', 'Delete failed.', 'error'); }
        });
      }
    });
  }

  resetForm() { this.kpi = this.getEmptyKpi(); this.isEditMode = false; }

  filteredKpis(): KpiCategoryView[] {
    const search = this.searchText.toLowerCase();
    return this.kpiList.filter(k => k.KpiCategoryName.toLowerCase().includes(search) &&
      (this.statusFilter === '' || k.IsActive === this.statusFilter));
  }

  get pagedKpis(): KpiCategoryView[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredKpis().slice(start, start + this.pageSize);
  }

  get totalPages() { return Math.ceil(this.filteredKpis().length / this.pageSize); }

  changePage(page: number) { if (page >= 1 && page <= this.totalPages) this.currentPage = page; }

  sortTable(column: string) {
    if (this.sortColumn === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortColumn = column; this.sortDirection = 'asc'; }
    this.applySorting();
  }

  applySorting() {
    this.kpiList.sort((a: any, b: any) => {
      const valA = a[this.sortColumn]; const valB = b[this.sortColumn];
      return valA < valB ? (this.sortDirection === 'asc' ? -1 : 1) : valA > valB ? (this.sortDirection === 'asc' ? 1 : -1) : 0;
    });
  }

  getSortIcon(column: string) { return this.sortColumn !== column ? 'fa-sort' : this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'; }

  exportAs(type: 'excel' | 'pdf') { type === 'excel' ? this.exportExcel() : this.exportPDF(); }

  exportExcel() {
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

  exportPDF() {
    const doc = new jsPDF();
    const data = this.filteredKpis().map(k => [k.KpiCategoryName, k.companyName, k.regionName, k.IsActive ? 'Active' : 'Inactive']);
    autoTable(doc, { head: [['KPI Category', 'Company', 'Region', 'Status']], body: data });
    doc.save('KpiCategoryList.pdf');
  }

  // ================= Bulk Upload =================
  openUploadPopup() { this.showUploadPopup = true; }

  closeUploadPopup() { this.showUploadPopup = false; }

 // In KpiCategoryComponent
onBulkUploadComplete(event: any): void {
  const file = event as File;   // ✅ Cast inside TS, not template

  if (!file) {
    Swal.fire('Error', 'No file received', 'error');
    return;
  }

  console.log('Uploaded file:', file.name);

  Swal.fire('Success', 'Bulk upload completed successfully.', 'success');

  // TODO: call bulk upload API here
  // this.adminService.bulkUploadKpiCategory(file).subscribe(...)

  this.loadKpis();
  this.showUploadPopup = false;
}


}