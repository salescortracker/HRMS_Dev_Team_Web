import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, EmployeeReferenceDto } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-employee-references',
  standalone: false,
  templateUrl: './employee-references.component.html',
  styleUrl: './employee-references.component.css'
})
export class EmployeeReferencesComponent  implements OnInit{
referenceForm!: FormGroup;
  references: EmployeeReferenceDto[] = [];

  // UI: search / sorting / pagination
  searchText = '';
  sortColumn: keyof EmployeeReferenceDto | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 15];

  editMode = false;
  editId: number | null = null;

  // audit/context
  userId = 0;
  companyId = 0;
  regionId = 0;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.userId = this.readUserIdFromStorage();
    this.companyId = Number(sessionStorage.getItem('CompanyId') ?? '') || 0;
    this.regionId = Number(sessionStorage.getItem('RegionId') ?? '') || 0;

    this.initForm();
    this.loadReferences();
  }

  // ---------- storage helper (robust) ----------
  private readUserIdFromStorage(): number {
    const keys = ['UserId', 'userId', 'user', 'currentUser'];
    const candidates: (string | null)[] = [];
    for (const k of keys) {
      candidates.push(sessionStorage.getItem(k));
      candidates.push(localStorage.getItem(k));
    }

    for (const raw of candidates) {
      if (!raw) continue;
      const s = raw.trim();

      if (/^\d+$/.test(s)) {
        const n = Number(s);
        if (n > 0) return n;
      }

      try {
        const obj = JSON.parse(s);
        const id = Number(obj?.UserId ?? obj?.userId ?? obj?.id ?? obj?.user?.id ?? 0);
        if (Number.isFinite(id) && id > 0) return id;
        if (typeof obj === 'string' && /^\d+$/.test(obj)) return Number(obj);
      } catch {
        // ignore parse errors
      }
    }

    return 0;
  }

  // ---------- form ----------
  get f() { return this.referenceForm.controls; }

  private initForm() {
    this.referenceForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-Z\s.'-]+$/)]],
      titleOrDesignation: ['', [Validators.required, Validators.maxLength(100)]],
      companyName: ['', [Validators.required, Validators.maxLength(150)]],
      emailId: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      mobileNumber: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^[0-9+ ]*$/)]]
    });
  }

  // ---------- load (use ONLY getReferencesByUserId) ----------
  loadReferences() {
    if (!this.userId || this.userId <= 0) {
      console.warn('No valid userId found. Cannot load references.');
      this.references = [];
      return;
    }

    this.loading = true;
    this.adminService.getReferencesByUserId(this.userId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          this.references = res ?? [];
          this.currentPage = 1;
        },
        error: (err) => {
          console.error('getReferencesByUserId error', err);
          Swal.fire('Error', 'Unable to load references. Please try again later.', 'error');
          this.references = [];
        }
      });
  }

  // ---------- submit ----------
  onSubmit() {
    if (this.referenceForm.invalid) {
      this.referenceForm.markAllAsTouched();
      return;
    }

    if (!this.userId || this.userId <= 0) {
      Swal.fire('Error', 'Unable to identify current user. Please login again.', 'error');
      return;
    }

    const fv = this.referenceForm.value;

    const payload: EmployeeReferenceDto = {
      referenceId: this.editId ?? 0,
      regionId: this.regionId,
      companyId: this.companyId,
      name: fv.name,
      titleOrDesignation: fv.titleOrDesignation,
      companyName: fv.companyName,
      emailId: fv.emailId,
      mobileNumber: fv.mobileNumber,
      userId: this.userId,
      createdBy: this.userId
    };

    if (this.editMode && this.editId) {
      payload.referenceId = this.editId;
      payload.modifiedBy = this.userId;

      this.adminService.updateReference(this.editId, payload).subscribe({
        next: () => {
          Swal.fire('Success', 'Reference updated', 'success');
          this.resetForm();
          this.loadReferences();
        },
        error: (err) => {
          console.error('updateReference error', err);
          Swal.fire('Error', 'Update failed', 'error');
        }
      });
    } else {
      this.adminService.addReference(payload).subscribe({
        next: () => {
          Swal.fire('Success', 'Reference saved', 'success');
          this.resetForm();
          this.loadReferences();
        },
        error: (err) => {
          console.error('addReference error', err);
          Swal.fire('Error', 'Save failed', 'error');
        }
      });
    }
  }

  // ---------- edit ----------
  edit(item: EmployeeReferenceDto) {
    this.editMode = true;
    this.editId = item.referenceId ?? null;

    this.referenceForm.patchValue({
      name: item.name,
      titleOrDesignation: item.titleOrDesignation,
      companyName: item.companyName,
      emailId: item.emailId,
      mobileNumber: item.mobileNumber
    });
  }

  // ---------- delete ----------
  delete(id: number | undefined) {
    if (!id) return;
    Swal.fire({
      title: 'Are you sure?',
      text: 'You cannot undo this action.',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.deleteReference(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Record deleted successfully', 'success');
            this.loadReferences();
          },
          error: (err) => {
            console.error('deleteReference error', err);
            Swal.fire('Error', 'Delete failed', 'error');
          }
        });
      }
    });
  }

  // ---------- reset ----------
  resetForm() {
    this.referenceForm.reset();
    this.editMode = false;
    this.editId = null;
  }

  // ---------- sorting ----------
  sortBy(column: keyof EmployeeReferenceDto) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
  }

  private getSortedReferences(): EmployeeReferenceDto[] {
    const data = [...this.references];
    if (!this.sortColumn) return data;

    data.sort((a, b) => {
      const aVal = (a as any)[this.sortColumn!] ?? '';
      const bVal = (b as any)[this.sortColumn!] ?? '';

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return this.sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }

  // ---------- filter + pagination ----------
  filteredReferences(): EmployeeReferenceDto[] {
    const s = (this.searchText ?? '').trim().toLowerCase();
    const data = this.getSortedReferences().filter(r => {
      if (!s) return true;
      const combined = `${r.name ?? ''} ${r.titleOrDesignation ?? ''} ${r.companyName ?? ''} ${r.emailId ?? ''} ${r.mobileNumber ?? ''}`.toLowerCase();
      return combined.includes(s);
    });

    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  private getFilteredTotalCount(): number {
    const s = (this.searchText ?? '').trim().toLowerCase();
    return this.getSortedReferences().filter(r => {
      if (!s) return true;
      const combined = `${r.name ?? ''} ${r.titleOrDesignation ?? ''} ${r.companyName ?? ''} ${r.emailId ?? ''} ${r.mobileNumber ?? ''}`.toLowerCase();
      return combined.includes(s);
    }).length;
  }

  // exposed to template: total filtered count
  get filteredCount(): number {
    return this.getFilteredTotalCount();
  }

  // exposed to template: visible range like "1–5"
  get showingRange(): string {
    const total = this.filteredCount;
    if (total === 0) return '0–0';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    let end = this.currentPage * this.pageSize;
    if (end > total) end = total;
    return `${start}–${end}`;
  }

  get totalPages(): number {
    const total = this.getFilteredTotalCount();
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  changePage(page: number) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
  }
}
