import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AdminService, W4Details } from '../../../../admin/servies/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-w4',
  templateUrl: './w4.component.html',
  standalone: false,
  styleUrls: ['./w4.component.css']
})
export class W4Component implements OnInit {
  w4Form!: FormGroup;
  w4List: W4Details[] = [];
  isEditMode = false;

  // User & Company Info
  userId!: number;
  companyId = Number(sessionStorage.getItem("CompanyId"));
  regionId = Number(sessionStorage.getItem("RegionId"));

  // States dropdown
  states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

  // ---------- Table Controls ----------
  searchText: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  pageSizeOptions = [5, 10, 20, 50];
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.initForm();
    this.loadW4List();
  }

  initForm() {
    const eid = Number(localStorage.getItem('employeeId')) || 1;
    this.w4Form = this.fb.group({
      w4Id: [0],
      employeeId: [eid, Validators.required],
      firstName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z\s]+$/)]],
      middleInitial: ['', [Validators.maxLength(1), Validators.pattern(/^[A-Z]?$/)]],
      lastName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z\s]+$/)]],
      ssn: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{2}-\d{4}$/)]],
      address: ['', [Validators.required, Validators.maxLength(250)]],
      city: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[A-Za-z\s]+$/)]],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5,6}(-\d{4})?$/)]],
      filingStatus: ['', Validators.required],
      multipleJobsOrSpouse: [false],
      totalDependents: [0, [Validators.required, Validators.min(0), Validators.max(99)]],
      dependentAmounts: [0, [Validators.max(9999999999)]],
      otherIncome: [0, [Validators.max(9999999999)]],
      deductions: [0, [Validators.max(9999999999)]],
      extraWithholding: [0, [Validators.max(9999999999)]],
      employeeSignature: ['', [Validators.required, Validators.maxLength(100)]],
      formDate: ['', [Validators.required, this.noFutureDateValidator]],
      regionId: [this.regionId],
      userId: [this.userId],
      companyId: [this.companyId]
    });
  }

  // ------------------- Field Helpers -------------------
  trimField(controlName: string) {
    const value = this.w4Form.get(controlName)?.value;
    if (value) this.w4Form.get(controlName)?.setValue(value.toString().trim());
  }

  toUpperCase(event: any, controlName: string) {
    this.w4Form.get(controlName)?.setValue(event.target.value.toUpperCase(), { emitEvent: false });
  }

  noFutureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const today = new Date();
    const selectedDate = new Date(control.value);
    return selectedDate > today ? { futureDate: true } : null;
  }

  // ------------------- Load W4 List -------------------
  loadW4List() {
    this.adminService.getW4List().subscribe({
      next: (data) => this.w4List = data,
      error: () => Swal.fire('Error', 'Failed to load W4 list', 'error')
    });
  }

  // ------------------- Save / Update W4 -------------------
  saveW4() {
    Object.keys(this.w4Form.controls).forEach(key => {
      const control = this.w4Form.get(key);
      if (control && typeof control.value === 'string') control.setValue(control.value.trim(), { emitEvent: false });
    });

    if (this.w4Form.invalid) {
      this.w4Form.markAllAsTouched();
      Swal.fire('Invalid', 'Please fill all required fields correctly', 'warning');
      return;
    }

    const w4: W4Details = { ...this.w4Form.value, userId: this.userId, companyId: this.companyId, regionId: this.regionId };

    if (this.isEditMode && w4.w4Id && w4.w4Id > 0) {
      this.adminService.updateW4(w4).subscribe({
        next: () => {
          this.loadW4List();
          this.resetForm();
          Swal.fire('Updated', 'W4 details updated successfully', 'success');
        },
        error: () => Swal.fire('Error', 'Failed to update W4 details', 'error')
      });
    } else {
      this.adminService.createW4(w4).subscribe({
        next: () => {
          this.loadW4List();
          this.resetForm();
          Swal.fire('Saved', 'W4 details saved successfully', 'success');
        },
        error: () => Swal.fire('Error', 'Failed to save W4 details', 'error')
      });
    }
  }

  // ------------------- Edit / Delete -------------------
  editW4(w4: W4Details) {
    this.isEditMode = true;
    this.w4Form.patchValue({ ...w4, formDate: w4.formDate ? new Date(w4.formDate).toISOString().split('T')[0] : '' });
  }

  deleteW4(w4Id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this W4? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.deleteW4(w4Id).subscribe({
          next: () => {
            this.w4List = this.w4List.filter(w => w.w4Id !== w4Id);
            Swal.fire('Deleted!', 'W4 details deleted successfully.', 'success');
          },
          error: () => Swal.fire('Error', 'Failed to delete W4 details', 'error')
        });
      }
    });
  }

  // ------------------- Reset Form -------------------
  resetForm() {
    this.isEditMode = false;
    const eid = Number(localStorage.getItem('employeeId')) || 1;
    this.w4Form.reset({
      w4Id: 0,
      employeeId: eid,
      firstName: '', middleInitial: '', lastName: '', ssn: '', address: '',
      city: '', state: '', zipCode: '', filingStatus: '',
      multipleJobsOrSpouse: false, totalDependents: 0, dependentAmounts: 0,
      otherIncome: 0, deductions: 0, extraWithholding: 0,
      employeeSignature: '', formDate: '',
      regionId: this.regionId, companyId: this.companyId, userId: this.userId
    });
  }

  // ------------------- Table: Search, Sort, Pagination -------------------
  filteredW4s(): W4Details[] {
    let data = this.w4List;

    // 1️⃣ Filter by search
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      data = data.filter(w =>
        (w.firstName ?? '').toLowerCase().includes(search) ||
        (w.lastName ?? '').toLowerCase().includes(search) ||
        (w.ssn ?? '').toLowerCase().includes(search) ||
        (w.address ?? '').toLowerCase().includes(search) ||
        (w.city ?? '').toLowerCase().includes(search) ||
        (w.state ?? '').toLowerCase().includes(search) ||
        (w.zipCode ?? '').toLowerCase().includes(search) ||
        (w.filingStatus ?? '').toLowerCase().includes(search)
      );
    }

    // 2️⃣ Sort
    if (this.sortColumn) {
      data = data.sort((a: any, b: any) => {
        let valA = a[this.sortColumn] ?? '';
        let valB = b[this.sortColumn] ?? '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // 3️⃣ Pagination
    this.totalPages = Math.ceil(data.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return data.slice(start, end);
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
  }

  changePage(page: number) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
  }

  changePageSize(size: number) {
    this.pageSize = Number(size);
    this.currentPage = 1;
  }
}
