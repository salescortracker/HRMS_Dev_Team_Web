import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService, AttendanceStatus, Company, Region } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { mapTo, Observable, of, tap } from 'rxjs';
export interface AttendanceStatusView extends AttendanceStatus {
  companyName: string;
  regionName: string;
}

@Component({
  selector: 'app-attendance-status',
  standalone: false,
  templateUrl: './attendance-status.component.html',
  styleUrl: './attendance-status.component.css'
})
export class AttendanceStatusComponent implements OnInit {
    attendanceList: AttendanceStatusView[] = [];
  attendance!: AttendanceStatusView;

  companies: Company[] = [];
  regions: Region[] = [];

  companyMap: { [key: number]: string } = {};
  regionMap: { [key: number]: string } = {};

  companyId = Number(sessionStorage.getItem('CompanyId')) || 0;
  regionId = Number(sessionStorage.getItem('RegionId')) || 0;

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';

  pageSize = 5;
  currentPage = 1;

  sortColumn = 'AttendanceStatusID';
  sortDirection: 'asc' | 'desc' = 'desc';

  showUploadPopup = false;

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.attendance = this.getEmptyAttendance();
    this.loadCompanies();
  }

  getEmptyAttendance(): AttendanceStatusView {
    return {
      AttendanceStatusID: 0,
      AttendanceStatusName: '',
      IsActive: true,
      CompanyID: this.companyId,
      RegionID: this.regionId,
      companyName: this.companyMap[this.companyId] ?? '',
      regionName: this.regionMap[this.regionId] ?? ''
    };
  }

  // ================= LOAD MASTER =================
loadCompanies(): void {
  this.adminService.getCompanies().subscribe({
    next: res => {
      this.companies = res || [];
      this.companyMap = {};
      this.companies.forEach(c => this.companyMap[c.companyId] = c.companyName);

      // Default to first company if none selected
      this.companyId = this.companies.length ? this.companies[0].companyId : 0;

      this.loadRegions(false).subscribe(() => this.loadAttendance());
    },
    error: () => Swal.fire('Error', 'Failed to load companies', 'error')
  });
}


  loadRegions(reloadAttendance: boolean = true): Observable<void> {
    if (!this.companyId) return of();

    return this.adminService.getRegions(this.companyId).pipe(
     tap(res => {
  this.regions = res || [];
  this.regionMap = {};
  this.regions.forEach(r => this.regionMap[r.regionID] = r.regionName);

  // Default to first region if none selected
  this.regionId = this.regions.length ? this.regions[0].regionID : 0;

  this.attendance.CompanyID = this.companyId;
  this.attendance.RegionID = this.regionId;
  this.attendance.companyName = this.companyMap[this.companyId] ?? '—';
  this.attendance.regionName = this.regionMap[this.regionId] ?? '—';

  if (reloadAttendance) this.loadAttendance();
})
,
      mapTo(void 0)
    );
  }

  loadAttendance(): void {
    this.spinner.show();
    this.adminService.getAttendanceStatus().subscribe({
      next: res => {
        const data = res.data || res;

        this.attendanceList = data.map((a: any) => ({
          AttendanceStatusID: a.attendanceStatusID,
          AttendanceStatusName: a.attendanceStatusName,
          IsActive: a.isActive,
          CompanyID: a.companyID,
          RegionID: a.regionID,
          companyName: this.companyMap[a.companyID] ?? '—',
          regionName: this.regionMap[a.regionID] ?? '—'
        }));

        this.currentPage = 1;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Attendance Status', 'error');
      }
    });
  }

  // ================= DROPDOWN EVENTS =================
  onCompanyChange(): void {
    sessionStorage.setItem('CompanyId', this.companyId.toString());
    this.attendance.CompanyID = this.companyId;
    this.attendance.companyName = this.companyMap[this.companyId] ?? '—';
    this.regions = [];
    this.loadRegions(false).subscribe(); // Do not reload attendance yet
  }

  onRegionChange(): void {
    sessionStorage.setItem('RegionId', this.regionId.toString());
    this.attendance.RegionID = this.regionId;
    this.attendance.regionName = this.regionMap[this.regionId] ?? '—';
    this.loadAttendance();
  }

  // ================= CRUD =================
  onSubmit(): void {
  this.attendance.CompanyID = this.companyId;
  this.attendance.RegionID = this.regionId;
  this.attendance.companyName = this.companyMap[this.companyId] ?? '—';
  this.attendance.regionName = this.regionMap[this.regionId] ?? '—';

  this.spinner.show();
  const api$ = this.isEditMode
    ? this.adminService.updateAttendanceStatus(this.attendance)
    : this.adminService.createAttendanceStatus(this.attendance);

  api$.subscribe({
    next: () => {
      this.spinner.hide();
      Swal.fire(
        this.isEditMode ? 'Updated!' : 'Created!',
        'Attendance Status saved successfully.',
        'success'
      );

      // ✅ Update the table immediately without waiting for loadAttendance()
      if (this.isEditMode) {
        const index = this.attendanceList.findIndex(a => a.AttendanceStatusID === this.attendance.AttendanceStatusID);
        if (index !== -1) {
          this.attendanceList[index] = { ...this.attendance };
        }
      } else {
        this.attendanceList.unshift({ ...this.attendance });
      }

      this.resetForm();
    },
    error: () => {
      this.spinner.hide();
      Swal.fire('Error', 'Operation failed', 'error');
    }
  });
}

editAttendance(a: AttendanceStatusView): void {
  this.isEditMode = true;

  // Set the companyId for dropdown
  this.companyId = a.CompanyID;

  // Load regions for this company first
  this.loadRegions(false).subscribe(() => {
    // Now regionMap is populated, we can safely set regionId
    this.regionId = a.RegionID;

    // Set attendance values after maps are ready
    this.attendance = { ...a };
    this.attendance.companyName = this.companyMap[this.companyId] ?? '—';
    this.attendance.regionName = this.regionMap[this.regionId] ?? '—';
  });
}



  deleteAttendance(a: AttendanceStatusView): void {
    Swal.fire({
      title: `Delete "${a.AttendanceStatusName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(res => {
      if (res.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteAttendanceStatus(a.AttendanceStatusID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted!', 'Attendance Status deleted.', 'success');
            this.loadAttendance();
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
  // Reset dropdowns to defaults
  this.companyId = Number(sessionStorage.getItem('CompanyId')) || 0;
  this.regionId = Number(sessionStorage.getItem('RegionId')) || 0;

  // Reset attendance object
  this.attendance = {
    AttendanceStatusID: 0,
    AttendanceStatusName: '',
    IsActive: true,
    CompanyID: this.companyId,
    RegionID: this.regionId,
    companyName: this.companyMap[this.companyId] ?? '',
    regionName: this.regionMap[this.regionId] ?? ''
  };

  this.isEditMode = false;

  // Optional: reload regions for the current company to refresh the region dropdown
  if (this.companyId) {
    this.loadRegions(false).subscribe();
  }
}


  // ================= FILTER / SORT / PAGE =================
  filteredAttendance(): AttendanceStatusView[] {
    return this.attendanceList.filter(a =>
      a.AttendanceStatusName.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.statusFilter === '' || a.IsActive === this.statusFilter)
    );
  }

  get pagedAttendance(): AttendanceStatusView[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAttendance().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAttendance().length / this.pageSize) || 1;
  }

  changePage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  sortTable(col: string): void {
    this.sortDirection =
      this.sortColumn === col && this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortColumn = col;

    this.attendanceList.sort((a: any, b: any) =>
      a[col] < b[col]
        ? this.sortDirection === 'asc' ? -1 : 1
        : a[col] > b[col]
        ? this.sortDirection === 'asc' ? 1 : -1
        : 0
    );
  }

  getSortIcon(col: string): string {
    return this.sortColumn !== col
      ? 'fa-sort'
      : this.sortDirection === 'asc'
      ? 'fa-sort-up'
      : 'fa-sort-down';
  }

  // ================= EXPORT =================
  exportAs(type: 'excel' | 'pdf'): void {
    type === 'excel' ? this.exportExcel() : this.exportPDF();
  }

  exportExcel(): void {
    const data = this.filteredAttendance().map(a => ({
      'Attendance Status': a.AttendanceStatusName,
      Company: a.companyName,
      Region: a.regionName,
      Status: a.IsActive ? 'Active' : 'Inactive'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Status');
    XLSX.writeFile(wb, 'AttendanceStatus.xlsx');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    const data = this.filteredAttendance().map(a => [
      a.AttendanceStatusName,
      a.companyName,
      a.regionName,
      a.IsActive ? 'Active' : 'Inactive'
    ]);
    autoTable(doc, {
      head: [['Status', 'Company', 'Region', 'Active']],
      body: data
    });
    doc.save('AttendanceStatus.pdf');
  }

  // ================= BULK UPLOAD =================
  openUploadPopup() { this.showUploadPopup = true; }
  closeUploadPopup() { this.showUploadPopup = false; }

  onBulkUploadComplete(event: any): void {
    const file = event as File;

    if (!file) {
      Swal.fire('Error', 'No file received', 'error');
      return;
    }

    console.log('Uploaded file:', file.name);

    Swal.fire('Success', 'Bulk upload completed successfully.', 'success');

    // TODO: Call backend bulk upload API when ready
    // this.adminService.bulkUploadAttendanceStatus(file).subscribe(...)

    this.loadAttendance();
    this.showUploadPopup = false;
  }

}