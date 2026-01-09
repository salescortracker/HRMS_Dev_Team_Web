import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService,Company,LeaveStatus, Region } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
export interface LeaveStatusView extends LeaveStatus {
  companyName: string;
  regionName: string;
}

@Component({
  selector: 'app-leave-status',
  standalone: false,
  templateUrl: './leave-status.component.html',
  styleUrl: './leave-status.component.css'
})
export class LeaveStatusComponent {
   leaveList: LeaveStatusView[] = [];
  leave!: LeaveStatusView;

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  pageSize = 5;
  currentPage = 1;
  showUploadPopup = false;

  companies: Company[] = [];
  regions: Region[] = [];

  companyMap: { [key: number]: string } = {};
  regionMap: { [key: number]: string } = {};

  companyId: number = +(sessionStorage.getItem('CompanyId') || 0);
  regionId: number = +(sessionStorage.getItem('RegionId') || 0);

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  /* ================= Init ================= */

  ngOnInit(): void {
    this.companyId = Number(sessionStorage.getItem('CompanyId')) || 0;
    this.regionId = Number(sessionStorage.getItem('RegionId')) || 0;

    this.loadCompanies();
    this.leave = this.getEmptyLeave();
  }

  /* ================= Helpers ================= */

  getEmptyLeave(): LeaveStatusView {
    return {
      leaveStatusID: 0,
      leaveStatusName: '',
      isActive: true,
      companyID: this.companyId,
      regionID: this.regionId,
      companyName: this.companyMap[this.companyId] || '',
      regionName: this.regionMap[this.regionId] || ''
    };
  }

  /* ================= Company / Region ================= */

  loadCompanies(): void {
    this.adminService.getCompanies().subscribe({
      next: (res: Company[]) => {
        this.companies = res || [];
        this.companyMap = {};
        this.companies.forEach(c => this.companyMap[c.companyId] = c.companyName);

        if (this.companyId) {
          this.loadRegions();
        } else {
          this.loadLeaveStatus();
        }
      },
      error: () => Swal.fire('Error', 'Failed to load companies', 'error')
    });
  }

  loadRegions(): void {
    if (!this.companyId) {
      this.loadLeaveStatus();
      return;
    }

    this.adminService.getRegions(this.companyId).subscribe({
      next: (res: Region[]) => {
        this.regions = res || [];
        this.regionMap = {};
        this.regions.forEach(r => this.regionMap[r.regionID] = r.regionName);

        if (!this.regionId || !this.regionMap[this.regionId]) {
          this.regionId = this.regions.length ? this.regions[0].regionID : 0;
        }

        sessionStorage.setItem('RegionId', this.regionId.toString());
        this.leave.regionID = this.regionId;

        this.loadLeaveStatus();
      },
      error: () => Swal.fire('Error', 'Failed to load regions', 'error')
    });
  }

  onCompanyChange(): void {
  if (!this.companyId) {
    this.regions = [];
    this.regionId = 0;
    return;
  }

  // Save company selection
  sessionStorage.setItem('CompanyId', this.companyId.toString());

  // Reset region selection
  this.regionId = 0;
  this.regions = [];
  this.leave.regionID = 0;
  this.leave.companyID = this.companyId;

  // Load ONLY regions for selected company
  this.adminService.getRegions(this.companyId).subscribe({
    next: (res: Region[]) => {
      this.regions = res || [];

      // Rebuild region map ONLY from company regions
      this.regionMap = {};
      this.regions.forEach(r => {
        this.regionMap[r.regionID] = r.regionName;
      });
    },
    error: () => Swal.fire('Error', 'Failed to load regions', 'error')
  });
}

onRegionChange(): void {
  if (!this.regionId) return;

  sessionStorage.setItem('RegionId', this.regionId.toString());
  this.leave.regionID = this.regionId;

  // Optional: reload table if region-based filtering is needed
  // this.loadLeaveStatus();
}


  /* ================= CRUD ================= */

  loadLeaveStatus(): void {
    this.spinner.show();

    this.adminService.getLeaveStatus().subscribe({
      next: (res: any) => {
        const data = res.data || [];

        this.adminService.getRegions().subscribe({
          next: (allRegions: Region[]) => {
            this.regionMap = {};
            allRegions.forEach(r => this.regionMap[r.regionID] = r.regionName);

            this.leaveList = data.map((l: any) => ({
              leaveStatusID: l.leaveStatusID,
              leaveStatusName: l.leaveStatusName,
              isActive: l.isActive,
              companyID: l.companyID,
              regionID: l.regionID,
              companyName: this.companyMap[l.companyID] ?? '—',
              regionName: this.regionMap[l.regionID] ?? '—'
            }));

            this.currentPage = 1;
            this.spinner.hide();
          },
          error: () => {
            this.leaveList = data.map((l: any) => ({
              leaveStatusID: l.leaveStatusID,
              leaveStatusName: l.leaveStatusName,
              isActive: l.isActive,
              companyID: l.companyID,
              regionID: l.regionID,
              companyName: this.companyMap[l.companyID] ?? '—',
              regionName: '—'
            }));
            this.spinner.hide();
          }
        });
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Leave Status', 'error');
      }
    });
  }

  onSubmit(): void {
    this.leave.companyID = this.companyId;
    this.leave.regionID = this.regionId;

    this.spinner.show();
    const obs = this.isEditMode
      ? this.adminService.updateLeaveStatus(this.leave)
      : this.adminService.createLeaveStatus(this.leave);

    obs.subscribe({
      next: () => {
        this.spinner.hide();
        Swal.fire(this.isEditMode ? 'Updated!' : 'Added!',
          `Leave status ${this.isEditMode ? 'updated' : 'created'} successfully.`,
          'success');
        this.loadLeaveStatus();
        this.resetForm();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Operation failed.', 'error');
      }
    });
  }

  editLeave(l: LeaveStatusView): void {
    this.leave = { ...l };
    this.isEditMode = true;

    this.companyId = l.companyID;
    this.regionId = l.regionID;

    this.loadRegionsForEdit();
  }

  loadRegionsForEdit(): void {
    if (!this.companyId) return;

    this.adminService.getRegions(this.companyId).subscribe({
      next: (res: Region[]) => {
        this.regions = res || [];
        this.regionMap = {};
        this.regions.forEach(r => this.regionMap[r.regionID] = r.regionName);

        if (!this.regionMap[this.regionId]) {
          this.regionId = this.regions.length ? this.regions[0].regionID : 0;
        }

        this.leave.regionID = this.regionId;
      },
      error: () => Swal.fire('Error', 'Failed to load regions', 'error')
    });
  }

  deleteLeave(l: LeaveStatusView): void {
    Swal.fire({
      title: `Delete "${l.leaveStatusName}"?`,
      text: 'This action will permanently delete the leave status.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteLeaveStatus(l.leaveStatusID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted!', 'Leave status deleted successfully.', 'success');
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

  resetForm(): void {
    this.leave = this.getEmptyLeave();
    this.isEditMode = false;
  }

  /* ================= Search & Pagination ================= */

  filteredLeave(): LeaveStatusView[] {
    const search = this.searchText.toLowerCase();
    return this.leaveList.filter(l =>
      l.leaveStatusName.toLowerCase().includes(search) &&
      (this.statusFilter === '' || l.isActive === this.statusFilter)
    );
  }

  get pagedLeave(): LeaveStatusView[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLeave().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredLeave().length / this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  /* ================= Export ================= */

  exportAs(type: 'excel' | 'pdf'): void {
    type === 'excel' ? this.exportExcel() : this.exportPDF();
  }

  exportExcel(): void {
    const data = this.filteredLeave().map(l => ({
      'Leave Status': l.leaveStatusName,
      'Company': l.companyName,
      'Region': l.regionName,
      'Status': l.isActive ? 'Active' : 'Inactive'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Status');
    XLSX.writeFile(wb, 'LeaveStatusList.xlsx');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    const data = this.filteredLeave().map(l => [
      l.leaveStatusName,
      l.companyName,
      l.regionName,
      l.isActive ? 'Active' : 'Inactive'
    ]);

    autoTable(doc, {
      head: [['Leave Status', 'Company', 'Region', 'Status']],
      body: data
    });

    doc.save('LeaveStatusList.pdf');
  }

  /* ================= Bulk Upload ================= */

  openUploadPopup(): void {
    this.showUploadPopup = true;
  }

  closeUploadPopup(): void {
    this.showUploadPopup = false;
  }

  onBulkUploadComplete(event: any): void {
    const file = event as File;
    if (!file) {
      Swal.fire('Error', 'No file received', 'error');
      return;
    }

    Swal.fire('Success', 'Bulk upload completed successfully.', 'success');
    this.loadLeaveStatus();
    this.showUploadPopup = false;
  }
}