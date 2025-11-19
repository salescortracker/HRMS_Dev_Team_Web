import { Component, OnInit } from '@angular/core';
import { AdminService, Designation } from '../../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-designation',
  standalone: false,
  templateUrl: './designation.component.html',
  styleUrl: './designation.component.css'
})
export class DesignationComponent {
  designationModel:any;
 designations: Designation[] = [];
  designation: Designation = this.getEmptyDesignation();
  showUploadPopup = false;
  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  showUpload = false;

  // Pagination
  pageSize = 5;
  currentPage = 1;
  Math = Math;

  constructor(
    private adminservice: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  // ------------------------------------------------------------
  // 🔹 OnInit - Load Designations
  // ------------------------------------------------------------
  ngOnInit(): void {
    this.loadCompanies();
    this.loadRegions();
    this.loadDesignations();
     
  }
companies:any;
regions:any;
  loadCompanies(): void {
    debugger;
    this.adminservice.getCompanies().subscribe({
      next: (res:any) => (this.companies = res),
      error: () => Swal.fire('Error', 'Failed to load companies.', 'error')
    });
  }

  loadRegions(): void {
    this.adminservice.getRegions().subscribe({
      next: (res:any) => (this.regions = res),
      error: () => Swal.fire('Error', 'Failed to load regions.', 'error')
    });
  }
  getCompanyName(companyId: number): string {
    const c = this.companies.find((x:any) => x.companyID === companyId);
    return c ? c.companyName : '-';
  }

  getRegionName(regionId: number): string {
    const r = this.regions.find((x:any) => x.regionId === regionId);
    return r ? r.regionName : '-';
  }
  // 🔹 Bulk Upload Model for Template
  designationmodel: any = {
    designationName: 'Software Engineer',
    description: 'Handles development work',
    departmentName: 'IT Department',
    companyName: 'CoreTracker Pvt Ltd',
    regionName: 'Hyderabad',
    isActive: true
  };

  // ------------------------------------------------------------
  // 🔹 Empty Designation Model
  // ------------------------------------------------------------
  getEmptyDesignation(): Designation {
    return {
      designationID: 0,
      companyId: 0,
      regionId: 0,
      designationName: '',
      description: '',
      isActive: true
    };
  }
 changePageSize(event: any): void {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
  }
   exportAs(type: 'excel' | 'pdf') {
    if (type === 'excel') this.exportExcel();
    else this.exportPDF();
  }
  // ------------------------------------------------------------
  // 🔹 Load All Designations
  // ------------------------------------------------------------

  // ...

  // Sorting
  sortColumn: string = 'designationID';
  sortDirection: 'asc' | 'desc' = 'desc'; // Latest first

  // ------------------------------------------
  // Load Designations
  // ------------------------------------------
  loadDesignations(): void {
    this.spinner.show();
    this.adminservice.getDesignations().subscribe({
      next: (res: any) => {
        // sort by ID descending (latest first)
        this.designations = res.data.data.sort((a: any, b: any) => b.designationID - a.designationID);
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error loading designations:', err);
        this.spinner.hide();
      }
    });
  }

  // ------------------------------------------------------------
  // 🔹 Submit Form - Add or Update
  // ------------------------------------------------------------
  onSubmit(): void {
    this.spinner.show();
    if (this.isEditMode) {
      this.adminservice.updateDesignation(this.designation.designationID, this.designation).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Success', `${this.designation.designationName} updated successfully!`, 'success');
          this.loadDesignations();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Update failed! Please contact IT Administrator.', 'error');
        }
      });
    } else {
      this.adminservice.createDesignation(this.designation).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Success', `${this.designation.designationName} added successfully!`, 'success');
          this.loadDesignations();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Create failed! Please contact IT Administrator.', 'error');
        }
      });
    }
  }

  // ------------------------------------------------------------
  // 🔹 Edit Designation
  // ------------------------------------------------------------
  editDesignation(d: Designation): void {
    this.designation = { ...d };
    this.isEditMode = true;
  }

  // ------------------------------------------------------------
  // 🔹 Delete (Soft Delete)
  // ------------------------------------------------------------
  deleteDesignation(d: Designation): void {
    Swal.fire({
      title: `Are you sure you want to delete ${d.designationName}?`,
      showDenyButton: true,
      confirmButtonText: 'Confirm'
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminservice.deleteDesignation(d.designationID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted!', `${d.designationName} deleted successfully.`, 'success');
            this.loadDesignations();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed! Please contact IT Administrator.', 'error');
          }
        });
      }
    });
  }

  // ------------------------------------------------------------
  // 🔹 Reset Form
  // ------------------------------------------------------------
  resetForm(): void {
    this.designation = this.getEmptyDesignation();
    this.isEditMode = false;
  }

  // ------------------------------------------------------------
  // 🔹 Filtered Designations
  // ------------------------------------------------------------
  filteredDesignations(): Designation[] {
    const search = this.searchText.toLowerCase();
    return this.designations.filter(d => {
      const matchesSearch = d.designationName.toLowerCase().includes(search);
      const matchesStatus = this.statusFilter === '' || d.isActive === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  // ------------------------------------------------------------
  // 🔹 Pagination
  // ------------------------------------------------------------
  get totalPages(): number {
    return Math.ceil(this.filteredDesignations().length / this.pageSize);
  }


  goToPage(page: number): void {
    this.currentPage = page;
  }

  // ------------------------------------------------------------
  // 🔹 Export (Excel / PDF)
  // ------------------------------------------------------------
  exportExcel() {
    const exportData = this.designations.map(d => ({
      'Designation Name': d.designationName,
      'Description': d.description || '',
      'Department Name': (d as any).departmentName || '',
      'Company Name': (d as any).companyName || '',
      'Region Name': (d as any).regionName || '',
      'Status': d.isActive ? 'Active' : 'Inactive'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Designations');
    XLSX.writeFile(wb, 'DesignationList.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const exportData = this.designations.map(d => [
      d.designationName,
      d.description || '',
      (d as any).departmentName || '',
      (d as any).companyName || '',
      (d as any).regionName || '',
      d.isActive ? 'Active' : 'Inactive'
    ]);
    autoTable(doc, {
      head: [['Designation Name', 'Description', 'Department', 'Company', 'Region', 'Status']],
      body: exportData
    });
    doc.save('DesignationList.pdf');
  }

  // ------------------------------------------------------------
  // 🔹 Bulk Upload
  // ------------------------------------------------------------
  onBulkUploadComplete(data: any): void {
    if (data && data.length > 0) {
      this.adminservice.bulkInsertData('Designation', data).subscribe({
        next: () => {
          Swal.fire('Success', 'Designations uploaded successfully!', 'success');
          this.loadDesignations();
          this.closeUploadPopup();
        },
        error: () => Swal.fire('Error', 'Failed to upload designations.', 'error')
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
    this.showUpload = false;
  }
   // ------------------------------------------
  // Sorting
  // ------------------------------------------
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      // toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  applySorting(): void {
    this.designations.sort((a: any, b: any) => {
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

  // ------------------------------------------
  // Pagination adjusted for sorting
  // ------------------------------------------
  get pagedDesignations(): Designation[] {
    const sorted = [...this.filteredDesignations()];
    this.applySorting();
    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }
}


