import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface Relationship {
  RelationshipID: number;
  RelationshipName: string;
  IsActive: boolean;
  CompanyID?: number;
  RegionID?: number;
  CompanyName?: string;
  RegionName?: string;
}

@Component({
  selector: 'app-relationship',
  templateUrl: './relationship.component.html',
  styleUrls: ['./relationship.component.css'],
  standalone: false
})
export class RelationshipComponent implements OnInit {

  relationship: Relationship = this.getEmptyRelationship();
  relationshipModel: Relationship = this.getEmptyRelationship();

  relationships: Relationship[] = [];
  companies: { CompanyID: number, CompanyName: string }[] = [];
  regions: { RegionID: number, RegionName: string }[] = [];

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  companyFilter: number | '' = '';
  regionFilter: number | '' = '';
  showUploadPopup = false;

  currentPage = 1;
  pageSize = 5;
  sortColumn = 'RelationshipID';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadRelationships();
  }

  getEmptyRelationship(): Relationship {
    return {
      RelationshipID: 0,
      RelationshipName: '',
      CompanyID: undefined,
      CompanyName: undefined,
      RegionID: undefined,
      RegionName: undefined,
      IsActive: true
    };
  }

  loadDropdowns(): void {
    this.adminService.getCompanies().subscribe(res => {
      this.companies = res.map(c => ({ CompanyID: c.companyId, CompanyName: c.companyName })) || [];
    });

    this.adminService.getRegions().subscribe(res => {
      this.regions = res.map(r => ({ RegionID: r.regionID, RegionName: r.regionName })) || [];
    });
  }

  loadRelationships(): void {
    this.spinner.show();
    this.adminService.getRelationshipStatuses().subscribe({
      next: (res: any) => {
        this.relationships = (res.data || []).map((r: any) => ({
          RelationshipID: r.relationshipId,
          RelationshipName: r.relationshipName,
          IsActive: r.isActive,
          CompanyID: r.companyId,
          RegionID: r.regionId,
          CompanyName: this.companies.find(c => c.CompanyID === r.companyId)?.CompanyName || '',
          RegionName: this.regions.find(rg => rg.RegionID === r.regionId)?.RegionName || ''
        }));
        this.applySorting();
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Relationship data.', 'error');
      }
    });
  }

  onSubmit(): void {
    if (!this.relationship.RelationshipName) {
      Swal.fire('Warning', 'Relationship Name is required', 'warning');
      return;
    }
    if (!this.relationship.CompanyID) {
      Swal.fire('Warning', 'Select a Company', 'warning');
      return;
    }
    if (!this.relationship.RegionID) {
      Swal.fire('Warning', 'Select a Region', 'warning');
      return;
    }

    this.spinner.show();
    const request$ = this.isEditMode
      ? this.adminService.updateRelationshipStatus(this.relationship)
      : this.adminService.createRelationshipStatus(this.relationship);

    request$.subscribe({
      next: () => {
        this.spinner.hide();
        Swal.fire(
          this.isEditMode ? 'Updated' : 'Added',
          `${this.relationship.RelationshipName} ${this.isEditMode ? 'updated' : 'added'} successfully!`,
          'success'
        );
        this.loadRelationships();
        this.resetForm();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', `${this.isEditMode ? 'Update' : 'Create'} failed.`, 'error');
      }
    });
  }

  editRelationship(r: Relationship): void {
    this.relationship = { ...r };
    this.isEditMode = true;
  }

  deleteRelationship(r: Relationship): void {
    Swal.fire({
      title: `Are you sure you want to delete ${r.RelationshipName}?`,
      showDenyButton: true,
      confirmButtonText: 'Confirm'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteRelationshipStatus(r.RelationshipID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted', `${r.RelationshipName} deleted successfully.`, 'success');
            this.loadRelationships();
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
    this.relationship = this.getEmptyRelationship();
    this.isEditMode = false;
  }

  filteredRelationships(): Relationship[] {
    const search = this.searchText.toLowerCase();
    return this.relationships.filter(r =>
      (r.RelationshipName || '').toLowerCase().includes(search) &&
      (this.statusFilter === '' || r.IsActive === this.statusFilter) &&
      (this.companyFilter === '' || r.CompanyID === this.companyFilter) &&
      (this.regionFilter === '' || r.RegionID === this.regionFilter)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRelationships().length / this.pageSize);
  }

  get pagedRelationships(): Relationship[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRelationships().slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

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
    this.relationships.sort((a: any, b: any) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  exportAs(type: 'excel' | 'pdf') {
    if (type === 'excel') this.exportExcel();
    else this.exportPDF();
  }

  exportExcel() {
    const data = this.relationships.map(r => ({
      'Relationship Name': r.RelationshipName || '',
      'Company': r.CompanyName || '',
      'Region': r.RegionName || '',
      'Status': r.IsActive ? 'Active' : 'Inactive'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relationships');
    XLSX.writeFile(wb, 'RelationshipList.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const data = this.relationships.map(r => [
      r.RelationshipName || '',
      r.CompanyName || '',
      r.RegionName || '',
      r.IsActive ? 'Active' : 'Inactive'
    ]);
    autoTable(doc, { head: [['Relationship', 'Company', 'Region', 'Status']], body: data });
    doc.save('RelationshipList.pdf');
  }

  onBulkUploadComplete(data: any): void {
    if (!data || data.length === 0) {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
      return;
    }
    this.adminService.bulkInsertData('Relationship', data).subscribe({
      next: () => {
        Swal.fire('Success', 'Data uploaded successfully!', 'success');
        this.loadRelationships();
        this.closeUploadPopup();
      },
      error: () => Swal.fire('Error', 'Failed to upload data.', 'error')
    });
  }

  openUploadPopup() { this.showUploadPopup = true; }
  closeUploadPopup() { this.showUploadPopup = false; }

}
