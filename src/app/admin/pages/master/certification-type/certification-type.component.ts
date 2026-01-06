import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AdminService,CertificationType } from '../../../servies/admin.service';  
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
interface UploadModel {
  name: string;
  structure: any;     // REQUIRED by app-common-upload
  columns: string[];  // REQUIRED internally
  data: any[];        // REQUIRED internally
}


@Component({
  selector: 'app-certification-type',
  standalone: false,
  templateUrl: './certification-type.component.html',
  styleUrl: './certification-type.component.css'
})
export class CertificationTypeComponent implements OnInit {
  
  certifications: CertificationType[] = [];
  certification!: CertificationType;
  isEditMode = false;

  searchText = '';
  statusFilter: boolean | '' = '';
  pageSize = 5;
  currentPage = 1;

  companyId!: number;
  regionId!: number;

  sortColumn: keyof CertificationType | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  showUploadPopup = false;
  certificationModel!: UploadModel;

  constructor(
    private adminService: AdminService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.companyId = Number(sessionStorage.getItem('CompanyId'));
    this.regionId = Number(sessionStorage.getItem('RegionId'));

    if (!this.companyId || !this.regionId) {
      Swal.fire('Error', 'Company / Region not found', 'error');
      return;
    }

    this.resetForm();
    this.loadCertifications();
  }

  // ================= FORM =================
  resetForm(): void {
    this.certification = {
      CertificationTypeID: 0,
      CertificationTypeName: '',
      IsActive: true,
      CompanyID: this.companyId,
      RegionID: this.regionId
    };
    this.isEditMode = false;
  }

  onSubmit(): void {
    const api$ = this.isEditMode
      ? this.adminService.updateCertificationType(
          this.certification.CertificationTypeID,
          this.certification
        )
      : this.adminService.createCertificationType(this.certification);

    api$.subscribe(() => {
      Swal.fire('Success', 'Saved successfully', 'success');
      this.resetForm();
      this.loadCertifications();
    });
  }

  editCertification(c: CertificationType): void {
    this.certification = { ...c };
    this.isEditMode = true;
  }

  // ================= HARD DELETE =================
  deleteCertification(c: CertificationType): void {
    Swal.fire({
      title: 'Delete Certification?',
      text: 'This will permanently delete the record',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService
          .deleteCertificationType(c.CertificationTypeID)
          .subscribe({
            next: () => {
              Swal.fire('Deleted', 'Record deleted successfully', 'success');
              this.loadCertifications();
            },
            error: () => {
              Swal.fire('Error', 'Delete failed', 'error');
            }
          });
      }
    });
  }

  // ================= LIST =================
  loadCertifications(): void {
    this.adminService
      .getCertificationTypes(this.companyId, this.regionId)
      .subscribe(res => {
        this.certifications = (res?.data || []).map((x: any) => ({
          CertificationTypeID: x.certificationTypeID,
          CertificationTypeName: x.certificationTypeName,
          IsActive: x.isActive,
          CompanyID: x.companyID,
          RegionID: x.regionID
        }));
      });
  }

  filteredCertifications(): CertificationType[] {
    return this.certifications.filter(c =>
      c.CertificationTypeName
        .toLowerCase()
        .includes(this.searchText.toLowerCase()) &&
      (this.statusFilter === '' || c.IsActive === this.statusFilter)
    );
  }

  get pagedCertifications(): CertificationType[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCertifications().slice(start, start + this.pageSize);
  }

  // ================= EXPORT =================
  exportAs(type: 'pdf' | 'excel'): void {
    if (type === 'excel') {
      const ws = XLSX.utils.json_to_sheet(this.filteredCertifications());
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'CertificationTypes');
      XLSX.writeFile(wb, 'CertificationTypes.xlsx');
    } else {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Certification Type', 'Status']],
        body: this.filteredCertifications().map(c => [
          c.CertificationTypeName,
          c.IsActive ? 'Active' : 'Inactive'
        ])
      });
      doc.save('CertificationTypes.pdf');
    }
  }

  // ================= BULK UPLOAD =================
  openUploadPopup(): void {
    this.certificationModel = {
      name: 'CertificationType',
      structure: {
        CertificationTypeName: '',
        IsActive: true,
        CompanyID: this.companyId,
        RegionID: this.regionId
      },
      columns: [
        'CertificationTypeName',
        'IsActive',
        'CompanyID',
        'RegionID'
      ],
      data: []
    };

    this.cd.detectChanges();
    this.showUploadPopup = true;
  }

  closeUploadPopup(): void {
    this.showUploadPopup = false;
  }

  onBulkUploadComplete(): void {
    Swal.fire('Success', 'Bulk upload completed', 'success');
    this.showUploadPopup = false;
    this.loadCertifications();
  }
// ================= SORTING =================
sortTable(column: keyof CertificationType): void {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  this.certifications.sort((a, b) => {
    const valueA = a[column];
    const valueB = b[column];

    if (valueA == null || valueB == null) return 0;

    const result =
      typeof valueA === 'string'
        ? valueA.localeCompare(valueB as string)
        : valueA > valueB
        ? 1
        : -1;

    return this.sortDirection === 'asc' ? result : -result;
  });
}

getSortIcon(column: keyof CertificationType): string {
  if (this.sortColumn !== column) {
    return 'fa-sort';
  }
  return this.sortDirection === 'asc'
    ? 'fa-sort-up'
    : 'fa-sort-down';
}

}