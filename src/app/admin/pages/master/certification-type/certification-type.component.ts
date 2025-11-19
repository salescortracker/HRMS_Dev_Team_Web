import { Component, OnInit } from '@angular/core';
import { AdminService,CertificationType } from '../../../servies/admin.service';  
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-certification-type',
  standalone: false,
  templateUrl: './certification-type.component.html',
  styleUrl: './certification-type.component.css'
})
export class CertificationTypeComponent {
  certificationModel: any;
  certifications: CertificationType[] = [];
  certification: CertificationType = this.getEmptyCertification();
  showUploadPopup = false;
  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  pageSize = 5;
  currentPage = 1;

  sortColumn: string = 'CertificationTypeID';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadCertifications();
  }

  getEmptyCertification(): CertificationType {
    return {
      CertificationTypeID: 0,
      CertificationTypeName: '',
      IsActive: true
    };
  }

  loadCertifications(): void {
    this.spinner.show();
    this.adminService.getCertificationTypes().subscribe({
      next: (res: any) => {
        this.certifications = res.data?.data || res;
        this.certifications.sort((a: any, b: any) => b.CertificationTypeID - a.CertificationTypeID);
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Certification Type data.', 'error');
      }
    });
  }

  onSubmit(): void {
    this.spinner.show();
    if (this.isEditMode) {
      this.adminService.updateCertificationType(this.certification.CertificationTypeID, this.certification).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Updated', `${this.certification.CertificationTypeName} updated successfully!`, 'success');
          this.loadCertifications();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Update failed. Please contact IT Administrator.', 'error');
        }
      });
    } else {
      this.adminService.createCertificationType(this.certification).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Added', `${this.certification.CertificationTypeName} added successfully!`, 'success');
          this.loadCertifications();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Create failed. Please contact IT Administrator.', 'error');
        }
      });
    }
  }

  editCertification(c: CertificationType): void {
    this.certification = { ...c };
    this.isEditMode = true;
  }

  deleteCertification(c: CertificationType): void {
    Swal.fire({
      title: `Are you sure you want to delete ${c.CertificationTypeName}?`,
      showDenyButton: true,
      confirmButtonText: 'Confirm'
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteCertificationType(c.CertificationTypeID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted', `${c.CertificationTypeName} deleted successfully.`, 'success');
            this.loadCertifications();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed. Please contact IT Administrator.', 'error');
          }
        });
      }
    });
  }

  resetForm(): void {
    this.certification = this.getEmptyCertification();
    this.isEditMode = false;
  }

  filteredCertifications(): CertificationType[] {
    const search = this.searchText.toLowerCase();
    return this.certifications.filter(c => {
      const matchesSearch = c.CertificationTypeName.toLowerCase().includes(search);
      const matchesStatus = this.statusFilter === '' || c.IsActive === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCertifications().length / this.pageSize);
  }

  goToPage(page: number): void {
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
    this.certifications.sort((a: any, b: any) => {
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

  get pagedCertifications(): CertificationType[] {
    const sorted = [...this.filteredCertifications()];
    this.applySorting();
    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  exportAs(type: 'excel' | 'pdf') {
    if (type === 'excel') this.exportExcel();
    else this.exportPDF();
  }

  exportExcel() {
    const exportData = this.certifications.map(c => ({
      'Certification Type': c.CertificationTypeName,
      'Status': c.IsActive ? 'Active' : 'Inactive'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Certification Types');
    XLSX.writeFile(wb, 'CertificationTypeList.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const exportData = this.certifications.map(c => [
      c.CertificationTypeName,
      c.IsActive ? 'Active' : 'Inactive'
    ]);
    autoTable(doc, {
      head: [['Certification Type', 'Status']],
      body: exportData
    });
    doc.save('CertificationTypeList.pdf');
  }

  onBulkUploadComplete(data: any): void {
    if (data && data.length > 0) {
      this.adminService.bulkInsertData('CertificationType', data).subscribe({
        next: () => {
          Swal.fire('Success', 'Certification Type data uploaded successfully!', 'success');
          this.loadCertifications();
          this.closeUploadPopup();
        },
        error: () => Swal.fire('Error', 'Failed to upload data.', 'error')
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
  }
}
