import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AdminService, DropdownGenderDto, EmployeeFamilyDto, RelationshipDto } from '../../../../admin/servies/admin.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-employee-family-details',
  standalone: false,
  templateUrl: './employee-family-details.component.html',
  styleUrl: './employee-family-details.component.css'
})
export class EmployeeFamilyDetailsComponent {
  familyForm!: FormGroup;
  familyList: EmployeeFamilyDto[] = [];

  relationships: RelationshipDto[] = [];
  genders: DropdownGenderDto[] = [];

  userId!: number;
  companyId!: number;
  regionId!: number;

  // UI: search / sorting / pagination
  searchText = '';
  sortColumn: keyof EmployeeFamilyDto | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  pageSize = 5;
  currentPage = 1;
  // updated to 5,10,15 per request
  pageSizeOptions = [5, 10, 15];

  editMode = false;
  editId: number | null = null;

  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit(): void {
    // get user id robustly
    this.userId = this.readUserIdFromStorage();
    this.companyId = Number(sessionStorage.getItem('CompanyId') ?? '') || 0;
    this.regionId = Number(sessionStorage.getItem('RegionId') ?? '') || 0;

    this.initForm();
    this.loadDropdowns();
    this.loadFamily();
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

      // plain numeric string
      if (/^\d+$/.test(s)) {
        const n = Number(s);
        if (n > 0) return n;
      }

      // JSON shapes
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
  get f() { return this.familyForm.controls; }

  initForm() {
    this.familyForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/^[a-zA-Z\s.'-]+$/)]],
      relationshipId: [null, Validators.required],
      dateOfBirth: ['', Validators.required],
      genderId: [null, Validators.required],
      occupation: ['', [Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9 \-&,\/.]*$/)]],
      phone: ['', [Validators.maxLength(20), Validators.pattern(/^[0-9+\-\s()]*$/)]],
      address: ['', [Validators.maxLength(500)]],
      isDependent: [false]
    });
  }

  // ---------- load dropdowns ----------
  loadDropdowns() {
    this.adminService.getRelationships().subscribe({
      next: (res) => this.relationships = res ?? [],
      error: (err) => console.error('getRelationships error', err)
    });

    this.adminService.getGenders().subscribe({
      next: (res) => this.genders = res ?? [],
      error: (err) => console.error('getGenders error', err)
    });
  }

  // ---------- load family ----------
  loadFamily() {
    if (!this.userId || this.userId <= 0) {
      console.warn('No valid userId in storage; skipping loadFamily.');
      return;
    }

    this.adminService.getFamilyByUserId(this.userId).subscribe({
      next: (res) => {
        this.familyList = res ?? [];
        this.currentPage = 1;
      },
      error: (err) => {
        console.error('getFamilyByUserId error', err);
      }
    });
  }

  // ---------- submit ----------
  onSubmit() {
    if (this.familyForm.invalid) {
      this.familyForm.markAllAsTouched();
      return;
    }

    if (!this.userId || this.userId <= 0) {
      Swal.fire('Error', 'Unable to identify current user. Please login again.', 'error');
      return;
    }

    const fv = this.familyForm.value;

    const payload: EmployeeFamilyDto = {
      familyId: this.editId ?? 0,
      userId: this.userId,
      companyId: this.companyId,
      regionId: this.regionId,
      name: fv.name,
      relationshipId: fv.relationshipId ? Number(fv.relationshipId) : undefined,
      relationship: this.getRelationshipNameById(fv.relationshipId),
      dateOfBirth: fv.dateOfBirth,
      genderId: fv.genderId ? Number(fv.genderId) : undefined,
      gender: this.getGenderNameById(fv.genderId),
      occupation: fv.occupation,
      phone: fv.phone,
      address: fv.address,
      isDependent: fv.isDependent,
      createdBy: this.userId
    };

    if (this.editMode && this.editId) {
      this.adminService.updateFamily(this.editId, payload).subscribe({
        next: () => {
          Swal.fire('Success', 'Family details updated', 'success');
          this.resetForm();
          this.loadFamily();
        },
        error: (err) => {
          console.error('updateFamily error', err);
          Swal.fire('Error', 'Update failed', 'error');
        }
      });
    } else {
      this.adminService.addFamily(payload).subscribe({
        next: () => {
          Swal.fire('Success', 'Family details saved', 'success');
          this.resetForm();
          this.loadFamily();
        },
        error: (err) => {
          console.error('addFamily error', err);
          Swal.fire('Error', 'Save failed', 'error');
        }
      });
    }
  }

  // ---------- edit ----------
  edit(item: EmployeeFamilyDto) {
    this.editMode = true;
    this.editId = item.familyId;

    const dob = item.dateOfBirth ? new Date(item.dateOfBirth).toISOString().slice(0,10) : '';

    this.familyForm.patchValue({
      name: item.name,
      relationshipId: item.relationshipId ?? null,
      dateOfBirth: dob,
      genderId: item.genderId ?? null,
      occupation: item.occupation ?? '',
      phone: item.phone ?? '',
      address: item.address ?? '',
      isDependent: item.isDependent ?? false
    });
  }

  // ---------- delete ----------
  delete(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You cannot undo this action.',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.deleteFamily(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Record deleted successfully', 'success');
            this.loadFamily();
          },
          error: (err) => {
            console.error('deleteFamily error', err);
            Swal.fire('Error', 'Delete failed', 'error');
          }
        });
      }
    });
  }

  // ---------- reset ----------
  resetForm() {
    this.familyForm.reset();
    this.editMode = false;
    this.editId = null;
  }

  // ---------- sorting ----------
  sortBy(column: keyof EmployeeFamilyDto) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
  }

  private getSortedFamilies(): EmployeeFamilyDto[] {
    const data = [...this.familyList];
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
  filteredFamilies(): EmployeeFamilyDto[] {
    const s = (this.searchText ?? '').trim().toLowerCase();
    const data = this.getSortedFamilies().filter(f => {
      if (!s) return true;
      const combined = `${f.name ?? ''} ${f.relationship ?? ''} ${f.gender ?? ''} ${f.occupation ?? ''} ${f.phone ?? ''} ${f.address ?? ''}`.toLowerCase();
      return combined.includes(s);
    });

    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  private getFilteredTotalCount(): number {
    const s = (this.searchText ?? '').trim().toLowerCase();
    return this.getSortedFamilies().filter(f => {
      if (!s) return true;
      const combined = `${f.name ?? ''} ${f.relationship ?? ''} ${f.gender ?? ''} ${f.occupation ?? ''} ${f.phone ?? ''} ${f.address ?? ''}`.toLowerCase();
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

  // ---------- helpers ----------
  private getRelationshipNameById(id: number | null | undefined) {
    if (!id) return '';
    const r = this.relationships.find(x => x.relationshipID === Number(id));
    return r ? r.relationshipName : '';
  }

  private getGenderNameById(id: number | null | undefined) {
    if (!id) return '';
    const g = this.genders.find(x => x.genderId === Number(id));
    return g ? g.genderName : '';
  }


}
