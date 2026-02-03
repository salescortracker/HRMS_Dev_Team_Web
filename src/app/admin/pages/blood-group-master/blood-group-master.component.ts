import { Component, OnInit } from '@angular/core';
import { AdminService, BloodGroup, Company, Region } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-blood-group-master',
  standalone: false,
  templateUrl: './blood-group-master.component.html',
  styleUrl: './blood-group-master.component.css'
})
export class BloodGroupMasterComponent implements OnInit {
    // =======================
  // DATA
  // =======================
  bloodGroups: BloodGroup[] = [];
  companies: Company[] = [];
  regions: Region[] = [];

bloodGroup: BloodGroup = {
  bloodGroupId: 0,
  bloodGroupName: '',
  companyId: undefined,
  regionId: undefined,
  isActive: true
};


  isEditMode = false;

  // =======================
  // SEARCH / FILTER
  // =======================
  searchText: string = '';
  statusFilter: boolean | '' = '';

  // =======================
  // PAGINATION
  // =======================
  pageSize = 5;
  currentPage = 1;

  // =======================
  // SORTING
  // =======================
  sortColumn: string = 'bloodGroupName';
  sortDirection: 'asc' | 'desc' = 'asc';

  // =======================
  // BULK UPLOAD
  // =======================
  showUploadPopup = false;
  bloodGroupModel: any = {};

  constructor(private adminService: AdminService) {}

  // =======================
  // INIT
  // =======================
  ngOnInit(): void {
    this.loadCompanies();
    this.loadRegions();
    this.loadBloodGroups();
  }

  // =======================
  // LOAD DATA
  // =======================
  loadCompanies() {
    this.adminService.getCompanies().subscribe(res => this.companies = res || []);
  }

  loadRegions() {
    this.adminService.getRegions().subscribe(res => this.regions = res || []);
  }

  loadBloodGroups() {
    this.adminService.getBloodGroups().subscribe(res => {
      this.bloodGroups = res || [];
      this.applySorting();
    });
  }

  // =======================
  // SAVE / UPDATE
  // =======================
  onSubmit() {
    if (!this.bloodGroup.companyId || !this.bloodGroup.regionId) {
      Swal.fire('Warning', 'Please select Company and Region', 'warning');
      return;
    }

    const request = this.isEditMode
      ? this.adminService.updateBloodGroup(this.bloodGroup.bloodGroupId, this.bloodGroup)

      : this.adminService.createBloodGroup(this.bloodGroup);

    request.subscribe({
      next: () => {
        Swal.fire('Success', 'Saved successfully', 'success');
        this.loadBloodGroups();
        this.resetForm();
      },
      error: () => Swal.fire('Error', 'Save failed', 'error')
    });
  }

  editBloodGroup(bg: BloodGroup) {
    this.bloodGroup = { ...bg };
    this.isEditMode = true;
  }

  deleteBloodGroup(bg: BloodGroup) {
    Swal.fire({
      title: `Delete ${bg.bloodGroupName}?`,
      showCancelButton: true
    }).then(r => {
      if (r.isConfirmed) {
        this.adminService.deleteBloodGroup(bg.bloodGroupId).subscribe(() => {
          Swal.fire('Deleted', 'Record removed', 'success');
          this.loadBloodGroups();
        });
      }
    });
  }

  resetForm() {
    this.bloodGroup = {
      bloodGroupId: 0,
      bloodGroupName: '',
      companyId: undefined,
      regionId: undefined,
      isActive: true
    };
    this.isEditMode = false;
  }

  // =======================
  // FILTERING
  // =======================
  filteredBloodGroups(): BloodGroup[] {
    return this.bloodGroups.filter(b =>
      b.bloodGroupName.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.statusFilter === '' || b.isActive === this.statusFilter)
    );
  }

  // =======================
  // PAGINATION
  // =======================
  get pagedBloodGroups(): BloodGroup[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredBloodGroups().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredBloodGroups().length / this.pageSize);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // =======================
  // SORTING
  // =======================
  sortTable(column: string) {
    this.sortDirection =
      this.sortColumn === column && this.sortDirection === 'asc'
        ? 'desc'
        : 'asc';

    this.sortColumn = column;
    this.applySorting();
  }

  applySorting() {
    this.bloodGroups.sort((a: any, b: any) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];
      return this.sortDirection === 'asc'
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // =======================
  // DISPLAY HELPERS
  // =======================
  getCompanyName(id?: number): string {
    return this.companies.find(c => c.companyId === id)?.companyName || '-';
  }

  getRegionName(id?: number): string {
    return this.regions.find(r => r.regionID === id)?.regionName || '-';
  }

  // =======================
  // EXPORT
  // =======================
  exportAs(type: 'pdf' | 'excel') {
    type === 'pdf' ? this.exportPDF() : this.exportExcel();
  }

  exportExcel() {
    const ws = XLSX.utils.json_to_sheet(this.bloodGroups);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BloodGroups');
    XLSX.writeFile(wb, 'BloodGroups.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Blood Group', 'Company', 'Region', 'Status']],
      body: this.bloodGroups.map(b => [
        b.bloodGroupName,
        this.getCompanyName(b.companyId),
        this.getRegionName(b.regionId),
        b.isActive ? 'Active' : 'Inactive'
      ])
    });
    doc.save('BloodGroups.pdf');
  }

  // =======================
  // BULK UPLOAD
  // =======================
  openUploadPopup() {
    this.showUploadPopup = true;
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
  }

  onBulkUploadComplete(event: any) {
    Swal.fire('Success', 'Upload completed', 'success');
    this.loadBloodGroups();
    this.closeUploadPopup();
  }
}