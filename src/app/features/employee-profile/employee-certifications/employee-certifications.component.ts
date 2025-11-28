import { Component } from '@angular/core';
import { AdminService, EmployeeCertificationDto } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-employee-certifications',
  standalone: false,
  templateUrl: './employee-certifications.component.html',
  styleUrl: './employee-certifications.component.css'
})
export class EmployeeCertificationsComponent {
  certificationForm!: FormGroup;
  certificationList: EmployeeCertificationDto[] = [];
  selectedFile: File | null = null;

  userId!: number;
  companyId!: number;
  regionId!: number;

  certificationTypeList: any[] = [];

  editMode = false;
  editId: number | null = null;

  // Sorting
  sortColumn: keyof EmployeeCertificationDto | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // Search
  searchText = '';

  // Error tracking
  submitted = false;
  fileError = '';

  // Patterns
  namePattern = /^[A-Za-z0-9 .\-]{1,100}$/;
  descriptionPattern = /^[A-Za-z0-9 .,\-()]{1,200}$/;

  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    this.initializeForm();
    this.loadCertificationTypes();
    this.loadCertifications();
  }

  initializeForm() {
    this.certificationForm = this.fb.group({
      certificationName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(this.namePattern)]],
      certificationTypeId: ['', Validators.required],
      description: ['', [Validators.maxLength(200), Validators.pattern(this.descriptionPattern)]],
      documentFile: [''] // optional but required when adding
    });
  }

  get f() { return this.certificationForm.controls; }

  // FILE UPLOAD HANDLER
  onFileChange(event: any) {
    const file = event.target.files?.[0] ?? null;
    this.selectedFile = null;
    this.fileError = '';

    const fileControl = this.certificationForm.get('documentFile');

    if (!file) {
      fileControl?.setValue('');
      fileControl?.setErrors(null);
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      this.fileError = 'Only PDF, JPG, PNG allowed';
      fileControl?.setErrors({ invalidType: true });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.fileError = 'File size cannot exceed 5 MB';
      fileControl?.setErrors({ maxSize: true });
      return;
    }

    this.selectedFile = file;
    fileControl?.setValue(file.name);
    fileControl?.setErrors(null);
  }

 // inside EmployeeCertificationComponent

loadCertificationTypes() {
  this.adminService.getCertificationTypes().subscribe({
    next: res => {
      this.certificationTypeList = res || [];
      // once we have types, load certifications and map names
      this.loadCertifications();
    },
    error: err => {
      console.error('Failed to load certification types', err);
      // still load certifications (will show id if types missing)
      this.loadCertifications();
    }
  });
}

loadCertifications() {
  this.adminService.getCertificationsByUserId(this.userId).subscribe({
    next: (res) => {
      // map each item to include certificationTypeName using the loaded list
      this.certificationList = (res || []).map(item => {
        const type = this.certificationTypeList.find(t => t.certificationTypeId === item.certificationTypeId);
        return {
          ...item,
          certificationTypeName: type ? type.certificationTypeName : (item as any).certificationTypeName ?? '' // fallback
        } as EmployeeCertificationDto;
      });
    },
    error: (err) => {
      console.error('Error loading certifications:', err);
      this.certificationList = [];
    }
  });
}


  onSubmit() {
    this.submitted = true;

    const fileControl = this.certificationForm.get('documentFile');
    if (!this.editMode && !this.selectedFile) {
      this.fileError = 'Certificate document is required';
      fileControl?.setErrors({ required: true });
    }

    if (this.certificationForm.invalid) {
      this.certificationForm.markAllAsTouched();
      return;
    }

    const payload: any = {
      CertificationId: this.editId ?? 0,
      CertificationName: this.certificationForm.value.certificationName,
      CertificationTypeId: this.certificationForm.value.certificationTypeId,
      Description: this.certificationForm.value.description,
      CompanyId: this.companyId,
      RegionId: this.regionId,
      UserId: this.userId
    };

    const formData = new FormData();
    Object.keys(payload).forEach(key => formData.append(key, payload[key]));
    if (this.selectedFile) formData.append("DocumentFile", this.selectedFile);

    if (this.editMode) {
      this.adminService.updateCertification(this.editId!, formData).subscribe({
        next: () => {
          Swal.fire("Success", "Certification updated successfully", "success");
          this.resetForm();
          this.loadCertifications();
        },
        error: err => console.error(err)
      });
    } else {
      this.adminService.addCertification(formData).subscribe({
        next: () => {
          Swal.fire("Success", "Certification added successfully", "success");
          this.resetForm();
          this.loadCertifications();
        },
        error: err => console.error(err)
      });
    }
  }

  edit(item: EmployeeCertificationDto) {
    this.editMode = true;
    this.editId = item.certificationId;

    this.certificationForm.patchValue({
      certificationName: item.certificationName,
      certificationTypeId: item.certificationTypeId,
      description: item.description,
      documentFile: item.documentPath ? item.documentPath.split('/').pop() : ''
    });

    this.selectedFile = null;
    this.fileError = '';
    this.submitted = false;
  }

  delete(id: number) {
    Swal.fire({
      title: "Are you sure?",
      text: "You cannot undo this action.",
      icon: "warning",
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.deleteCertification(id).subscribe({
          next: () => {
            Swal.fire("Deleted!", "Record deleted successfully", "success");
            this.loadCertifications();
          },
          error: err => console.error(err)
        });
      }
    });
  }

  resetForm() {
    this.certificationForm.reset();
    this.selectedFile = null;
    this.editMode = false;
    this.editId = null;
    this.fileError = '';
    this.submitted = false;

    Object.keys(this.certificationForm.controls).forEach(k =>
      this.certificationForm.get(k)?.setErrors(null)
    );
  }

  viewDocument(path: string) {
    if (path) window.open(`https://localhost:44320/${path}`, '_blank');
  }

  // SEARCH + SORT + PAGINATION SAME AS EDUCATION

  filteredCertifications(): EmployeeCertificationDto[] {
    let filtered = this.certificationList;

    if (this.searchText) {
      const text = this.searchText.toLowerCase();
      filtered = filtered.filter(c =>
        c.certificationName.toLowerCase().includes(text) ||
        c.description?.toLowerCase().includes(text)
      );
    }

    if (this.sortColumn) {
      filtered.sort((a, b) => {
        const valA = (a[this.sortColumn!] ?? '').toString().toLowerCase();
        const valB = (b[this.sortColumn!] ?? '').toString().toLowerCase();
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
  }

  sortBy(column: keyof EmployeeCertificationDto) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }
onFilterChange() {
  this.currentPage = 1; // reset to page 1 when searching
}

  changePage(page: number) {
    this.currentPage = page;
  }

  get totalPages(): number {
    const filteredLength = this.certificationList.filter(c => {
      const text = this.searchText.toLowerCase();
      return !this.searchText ||
        c.certificationName.toLowerCase().includes(text) ||
        c.description?.toLowerCase().includes(text);
    }).length;
    return Math.ceil(filteredLength / this.pageSize);
  }
}
