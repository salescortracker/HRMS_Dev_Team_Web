import { Component } from '@angular/core';
import { AdminService, EmployeeEmergencyContactDto, RelationshipDto } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-employee-emergency-contact',
  standalone: false,
  templateUrl: './employee-emergency-contact.component.html',
  styleUrl: './employee-emergency-contact.component.css'
})
export class EmployeeEmergencyContactComponent {
   contactForm!: FormGroup;
  contactList: EmployeeEmergencyContactDto[] = [];

  relationships: RelationshipDto[] = [];

  userId!: number;
  companyId!: number;
  regionId!: number;

  // UI controls
  searchText = '';
  sortColumn: keyof EmployeeEmergencyContactDto | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 15];

  editMode = false;
  editId: number | null = null;

  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit(): void {
    this.userId = this.readUserIdFromStorage();
    console.log('EmployeeEmergencyContactComponent.ngOnInit userId=', this.userId);

    this.companyId = Number(sessionStorage.getItem('CompanyId') ?? '') || 0;
    this.regionId = Number(sessionStorage.getItem('RegionId') ?? '') || 0;

    this.initForm();
    this.loadDropdowns();
    this.loadContacts();
  }

  private readUserIdFromStorage(): number {
    const keys = ['UserId', 'userId', 'user', 'currentUser'];
    for (const k of keys) {
      const raw = sessionStorage.getItem(k) ?? localStorage.getItem(k);
      if (!raw) continue;
      const s = raw.trim();
      if (/^\d+$/.test(s)) {
        const n = Number(s);
        if (n > 0) return n;
      }
      try {
        const obj = JSON.parse(s);
        const id = Number(obj?.UserId ?? obj?.userId ?? obj?.id ?? 0);
        if (Number.isFinite(id) && id > 0) return id;
      } catch { }
    }
    return 0;
  }

  // Form helpers
  get f() { return this.contactForm.controls; }

  initForm() {
    this.contactForm = this.fb.group({
      contactName: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/^[a-zA-Z\s.'-]+$/)]],
      relationshipId: [null, Validators.required],
      phoneNumber: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[0-9+\-\s()]*$/)]],
      alternatePhone: ['', [Validators.maxLength(20), Validators.pattern(/^[0-9+\-\s()]*$/)]],
      email: ['', [Validators.email, Validators.maxLength(200)]],
      address: ['', [Validators.maxLength(500)]]
    });
  }

  loadDropdowns() {
    this.adminService.getRelationships().subscribe({
      next: (res) => this.relationships = res ?? [],
      error: (err) => console.error('getRelationships error', err)
    });
  }

  loadContacts() {
    console.log('loadContacts called. userId=', this.userId);
    if (!this.userId || this.userId <= 0) {
      console.warn('No valid userId in storage; skipping loadContacts.');
      return;
    }

    this.adminService.getEmergencyContactsByUserId(this.userId).subscribe({
      next: (res) => {
        console.log('getEmergencyContactsByUserId response', res);
        this.contactList = res ?? [];
        this.currentPage = 1;
      },
      error: (err) => {
        console.error('getEmergencyContactsByUserId error', err);
        Swal.fire('Error', 'Unable to load emergency contacts', 'error');
      }
    });
  }

  // debug helper to force a fetch from UI
 
 onSubmit() {
  if (this.contactForm.invalid) {
    this.contactForm.markAllAsTouched();
    return;
  }

  // ensure userId valid
  if (!this.userId || this.userId <= 0) {
    Swal.fire('Error', 'Unable to identify current user. Please login again.', 'error');
    return;
  }

  const fv = this.contactForm.value;

  // Build payload only with values that are present (remove undefined/null for optional fields)
  const payload: any = {
    EmergencyContactId: this.editId ?? 0,    // PascalCase optional — server accepts case-insensitive but this is clearer
    UserId: Number(this.userId),
    EmployeeId: Number(this.userId),
    CompanyId: this.companyId ? Number(this.companyId) : null,
    RegionId: this.regionId ? Number(this.regionId) : null,
    ContactName: (fv.contactName ?? '').trim(),
    RelationshipId: fv.relationshipId ? Number(fv.relationshipId) : null,
    PhoneNumber: fv.phoneNumber ? String(fv.phoneNumber).trim() : null,
    AlternatePhone: fv.alternatePhone ? String(fv.alternatePhone).trim() : null,
    Email: fv.email ? String(fv.email).trim() : null,
    Address: fv.address ? String(fv.address).trim() : null,
    CreatedBy: String(this.userId)
  };

  // remove null properties to avoid sending null for optional fields (helps with some DTO rules)
  Object.keys(payload).forEach(k => {
    if (payload[k] === null || payload[k] === undefined) delete payload[k];
  });

  console.log('Submitting emergency contact payload:', payload);

  // Send and log full response/error details for debugging
  if (this.editMode && this.editId) {
    this.adminService.updateEmergencyContact(this.editId, payload).subscribe({
      next: (res) => {
        console.log('updateEmergencyContact success', res);
        Swal.fire('Success', 'Contact updated', 'success');
        this.resetForm();
        this.loadContacts();
      },
      error: (err) => {
        console.error('updateEmergencyContact error', err);
        console.error('server error body:', err?.error);
        Swal.fire('Error', `Update failed: ${err?.status || ''}`, 'error');
      }
    });
  } else {
    this.adminService.addEmergencyContact(payload).subscribe({
      next: (res) => {
        console.log('addEmergencyContact success', res);
        Swal.fire('Success', 'Contact added', 'success');
        this.resetForm();
        this.loadContacts();
      },
      error: (err) => {
        console.error('addEmergencyContact error', err);
        console.error('server error body:', err?.error); // <<-- check ModelState from server here
        // show a friendly message; for debugging include server message
        const serverMsg = err?.error?.title || err?.error?.message || JSON.stringify(err?.error);
        Swal.fire('Error', `Save failed: ${serverMsg}`, 'error');
      }
    });
  }
}


 edit(item: EmployeeEmergencyContactDto) {
  this.editMode = true;
  this.editId = item.emergencyContactId;

  console.log('edit() called:', { editMode: this.editMode, editId: this.editId, item });

  this.contactForm.patchValue({
    contactName: item.contactName,
    relationshipId: item.relationshipId ?? null,
    phoneNumber: item.phoneNumber ?? '',
    alternatePhone: item.alternatePhone ?? '',
    email: item.email ?? '',
    address: item.address ?? ''
  });

  Swal.fire({
    icon: 'info',
    title: 'Edit Mode Enabled',
    text: 'You are now editing this emergency contact.',
    timer: 1500,
    showConfirmButton: false
  });
}


  delete(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You cannot undo this action.',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.deleteEmergencyContact(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Record deleted successfully', 'success');
            this.loadContacts();
          },
          error: (err) => {
            console.error('deleteEmergencyContact error', err);
            Swal.fire('Error', 'Delete failed', 'error');
          }
        });
      }
    });
  }

  resetForm() {
    this.contactForm.reset();
    this.editMode = false;
    this.editId = null;
  }

  // sorting
  sortBy(column: keyof EmployeeEmergencyContactDto) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
  }

  private getSortedContacts(): EmployeeEmergencyContactDto[] {
    const data = [...this.contactList];
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

  // filter + pagination
  filteredContacts(): EmployeeEmergencyContactDto[] {
    const s = (this.searchText ?? '').trim().toLowerCase();
    const data = this.getSortedContacts().filter(f => {
      if (!s) return true;
      const combined = `${f.contactName ?? ''} ${f.relationship ?? ''} ${f.phoneNumber ?? ''} ${f.alternatePhone ?? ''} ${f.email ?? ''} ${f.address ?? ''}`.toLowerCase();
      return combined.includes(s);
    });

    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  private getFilteredTotalCount(): number {
    const s = (this.searchText ?? '').trim().toLowerCase();
    return this.getSortedContacts().filter(f => {
      if (!s) return true;
      const combined = `${f.contactName ?? ''} ${f.relationship ?? ''} ${f.phoneNumber ?? ''} ${f.alternatePhone ?? ''} ${f.email ?? ''} ${f.address ?? ''}`.toLowerCase();
      return combined.includes(s);
    }).length;
  }

  get filteredCount(): number { return this.getFilteredTotalCount(); }

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

  changePageSize(size: number) { this.pageSize = size; this.currentPage = 1; }
  changePage(page: number) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
  }

  private getRelationshipNameById(id: number | null | undefined) {
    if (!id) return '';
    const r = this.relationships.find(x => x.relationshipID === Number(id));
    return r ? r.relationshipName : '';
  }
}
