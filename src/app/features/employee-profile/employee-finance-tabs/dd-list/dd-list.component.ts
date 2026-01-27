import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AdminService, EmployeeDdlist } from '../../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-dd-list',
  templateUrl: './dd-list.component.html',
  standalone: false,
  styleUrls: ['./dd-list.component.css']
})
export class DdListComponent implements OnInit {
  ddForm!: FormGroup;
  ddList: EmployeeDdlist[] = [];
  searchText: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage: number = 1;
  pageSize: number = 5;
  pageSizeOptions = [5, 10, 20];
  totalPages: number = 1;

  fileError: string = '';
  selectedFile: File | null = null;
  loading: boolean = false;

  userId!: number;
  companyId = Number(sessionStorage.getItem("CompanyId"));
  regionId = Number(sessionStorage.getItem("RegionId"));
  employeeId = 123; // Replace with actual employee ID
  baseUrl = 'https://localhost:44370/DDCopies/'; // Folder serving files

  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit() {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.initializeForm();
    this.loadDDList();
  }

  /** Initialize Form */
  private initializeForm() {
    this.ddForm = this.fb.group({
      ddlistId: [0],
      ddnumber: ['', [Validators.required, Validators.maxLength(20)]],
      dddate: ['', [Validators.required, this.noFutureDateValidator]],
      bankName: ['', Validators.required],
      branchName: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      payeeName: ['', Validators.required],
      ddcopyFilePath: [''],
      companyId: [this.companyId],
      regionId: [this.regionId],
      employeeId: [this.employeeId],
      userId: [this.userId]
    });
  }

  /** Validator: No future date */
  noFutureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const today = new Date();
    const selectedDate = new Date(control.value);
    return selectedDate > today ? { futureDate: true } : null;
  }

  /** Load DD list */
  loadDDList() {
    this.loading = true;
    this.adminService.getAllDdlist().subscribe({
      next: (list) => {
        this.ddList = list;
        this.updatePagination();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load DD list', 'error');
      }
    });
  }

  /** File selection */
  onFileSelected(event: any) {
    this.fileError = '';
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        this.fileError = 'Invalid file type. Only PDF, JPG, PNG allowed.';
        this.selectedFile = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.fileError = 'File size exceeds 5 MB.';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
    }
  }

  /** Save or Update DD */
  async saveDD() {
    if (this.ddForm.invalid || this.fileError) {
      this.ddForm.markAllAsTouched();
      Swal.fire('Invalid', 'Please fill all required fields correctly', 'warning');
      return;
    }

    this.loading = true;
    let fileName = this.ddForm.value.ddcopyFilePath;

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);

      try {
        const uploadResult: any = await lastValueFrom(this.adminService.uploadDDCopy(formData));
        fileName = uploadResult.fileName;
      } catch {
        this.loading = false;
        Swal.fire('Error', 'Failed to upload DD copy', 'error');
        return;
      }
    }

    const payload: EmployeeDdlist = {
      ...this.ddForm.value,
      ddcopyFilePath: fileName,
      userId: this.userId,
      companyId: this.companyId,
      regionId: this.regionId
    };

    const id = Number(this.ddForm.get("ddlistId")?.value);
    if (id > 0) {
      this.adminService.updateDdlist(payload).subscribe({
        next: () => {
          this.loadDDList();
          this.resetForm();
          this.loading = false;
          Swal.fire('Updated', 'DD details updated successfully', 'success');
        },
        error: () => {
          this.loading = false;
          Swal.fire('Error', 'Failed to update DD details', 'error');
        }
      });
    } else {
      this.adminService.createDdlist(payload).subscribe({
        next: () => {
          this.loadDDList();
          this.resetForm();
          this.loading = false;
          Swal.fire('Saved', 'DD details saved successfully', 'success');
        },
        error: () => {
          this.loading = false;
          Swal.fire('Error', 'Failed to save DD details', 'error');
        }
      });
    }
  }

  /** Edit DD */
  editDD(dd: EmployeeDdlist) {
    const dddateStr = dd.dddate ? new Date(dd.dddate).toISOString().split('T')[0] : '';
    this.ddForm.patchValue({ ...dd, dddate: dddateStr });
    this.selectedFile = null;
    this.fileError = '';
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if(fileInput) fileInput.value = '';
  }

  /** Delete DD */
  deleteDD(dd: EmployeeDdlist, index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete DD: ${dd.ddnumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteDdlist(dd.ddlistId).subscribe({
          next: () => {
            this.ddList.splice(index, 1);
            this.updatePagination();
            Swal.fire('Deleted!', 'DD details deleted successfully.', 'success');
          },
          error: () => Swal.fire('Error', 'Failed to delete DD details', 'error')
        });
      }
    });
  }

  /** Reset Form */
  resetForm() {
    this.ddForm.reset({
      ddlistId: 0,
      ddnumber: '',
      dddate: '',
      bankName: '',
      branchName: '',
      amount: 0,
      payeeName: '',
      ddcopyFilePath: '',
      companyId: this.companyId,
      regionId: this.regionId,
      employeeId: this.employeeId,
      userId: this.userId
    });
    this.fileError = '';
    this.selectedFile = null;
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if(fileInput) fileInput.value = '';
  }

  /** View document */
  viewDocument(fileName: string) {
    if (!fileName) return;
    const fileUrl = this.baseUrl + encodeURIComponent(fileName);
    window.open(fileUrl, '_blank');
  }

  /** ================= SEARCH, SORT & PAGINATION ================= */

  /** Filtered & sorted data for table display */
  filteredDDs(): EmployeeDdlist[] {
    let data = [...this.ddList];

    // Search filter
    if (this.searchText) {
      const text = this.searchText.toLowerCase();
      data = data.filter(dd =>
        dd.ddnumber.toLowerCase().includes(text) ||
        dd.bankName.toLowerCase().includes(text) ||
        dd.branchName.toLowerCase().includes(text) ||
        dd.payeeName.toLowerCase().includes(text)
      );
    }

    // Sorting
    if (this.sortColumn) {
      data.sort((a, b) => {
        let valA = a[this.sortColumn as keyof EmployeeDdlist];
        let valB = b[this.sortColumn as keyof EmployeeDdlist];

        valA = valA ?? '';
        valB = valB ?? '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    this.totalPages = Math.ceil(data.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  /** Change sort */
  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  /** Change page */
  changePage(page: number) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
  }

  /** Change page size */
  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePagination();
  }

  /** Update total pages (after delete or filter) */
  updatePagination() {
    this.totalPages = Math.ceil(this.ddList.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
  }
}
