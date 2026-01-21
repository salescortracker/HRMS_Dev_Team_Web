import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeePersonal } from '../../../../admin/layout/models/employee-personal.model';
import { AdminService } from '../../../../admin/servies/admin.service';

@Component({
  selector: 'app-employee-personal-details',
  standalone: false,
  templateUrl: './employee-personal-details.component.html',
  styleUrl: './employee-personal-details.component.css'
})
export class EmployeePersonalDetailsComponent implements OnInit{
personalForm!: FormGroup;
  editMode = false;
  editId: number | null = null;
  genders: any[] = [];

  userId!: number;
  companyId!: number;
  regionId!: number;

  // listing UI
  records: EmployeePersonal[] = [];
  storageKey = 'employee_personal_records_v1';

  // search / sort / pagination
  searchText = '';
  sortColumn: keyof EmployeePersonal | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 15];
  maritalNames: string[] = [];

  // file preview + file itself
  previewImage: string | null = null;
  profilePictureName: string | null = null;
  fileError: string | null = null;
  selectedFile: File | null = null;



  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRecords();      // keep localStorage fallback
    this.loadDropdowns();

    this.userId = Number(sessionStorage.getItem('userId'));
    this.companyId = Number(sessionStorage.getItem('CompanyId'));
    this.regionId = Number(sessionStorage.getItem('RegionId'));

    if (!this.userId) {
      console.error('UserId missing in sessionStorage');
    }

    // load server data (if your API is ready). This will override local records when server returns data.
    this.loadFromServer();

    // watch marital status for conditional marriage date validator
    this.personalForm.get('maritalStatus')?.valueChanges.subscribe(val => {
      const marriageControl = this.personalForm.get('marriageDate');
      if (val === 'Married') {
        marriageControl?.setValidators([Validators.required]);
        marriageControl?.enable({ emitEvent: false });
      } else {
        marriageControl?.clearValidators();
        marriageControl?.setValue(null, { emitEvent: false });
        marriageControl?.disable({ emitEvent: false });
      }
      marriageControl?.updateValueAndValidity({ emitEvent: false });
    });
  }

  // ----------------- load dropdowns (unchanged) -----------------
  loadDropdowns() {
    // Marital names - your adminService returns names shape you described
    this.adminService.getMaritalStatus().subscribe({
      next: (res: any) => {
        if (Array.isArray(res) && typeof res[0] === 'string') {
          this.maritalNames = res;
        } else if (Array.isArray(res) && res[0] && res[0].maritalStatus) {
          this.maritalNames = res.map((x: any) => x.maritalStatus);
        } else if (Array.isArray(res) && res[0] && res[0].name) {
          this.maritalNames = res.map((x: any) => x.name);
        } else {
          console.warn('Unknown marital status API shape:', res);
          this.maritalNames = [];
        }
      },
      error: (err) => console.error('getMaritalStatus error', err)
    });

    this.adminService.getGenders().subscribe({
      next: (res) => this.genders = res ?? [],
      error: (err) => console.error('getGenders error', err)
    });
  }

  private initForm() {
    this.personalForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z\s]+$/)]],
      lastName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z\s]+$/)]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]], // UI already uses genderId values
      mobileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(15), Validators.pattern(/^[0-9]{10,15}$/)]],
      personalEmail: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      permanentAddress: ['', [Validators.required, Validators.maxLength(250)]],
      presentAddress: ['', [Validators.required, Validators.maxLength(250)]],
      panNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)]],
      aadhaarNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
      // profile picture handled separately (file input)
      passportNumber: ['', [Validators.maxLength(20)]],
      placeOfBirth: ['', [Validators.maxLength(100)]],
      uan: ['', [Validators.pattern(/^[0-9]{12}$/)]],
      bloodGroup: ['', [Validators.required]],
      citizenship: ['', [Validators.maxLength(50)]],
      religion: ['', [Validators.maxLength(50)]],
      drivingLicence: ['', [Validators.maxLength(20)]],
      maritalStatus: ['', [Validators.required]],
      marriageDate: [{ value: null, disabled: true }, []],
      workPhone: ['', [Validators.maxLength(15), Validators.pattern(/^[0-9]*$/)]],
      linkedInProfile: ['', [Validators.maxLength(150), Validators.pattern(/^$|^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/i)]],
      previousExperienceText: ['', [Validators.maxLength(250)]],
      previousExperienceYears: [null, [Validators.min(0), Validators.max(50)]]
    });
  }

  get f(): any {
    return this.personalForm.controls as any;
  }

  // ---------------- FILE handling (modified) ----------------
  onFileChange(event: Event) {
    this.fileError = null;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.previewImage = null;
      this.profilePictureName = null;
      this.selectedFile = null;
      return;
    }
    const file = input.files[0];
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      this.fileError = 'Only JPG, JPEG, PNG allowed.';
      this.selectedFile = null;
      return;
    }
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      this.fileError = 'Max file size is 2MB.';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.profilePictureName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result ?? '');
      this.previewImage = base64;
    };
    reader.readAsDataURL(file);
  }

  // ---------------- Submit (send to server) ----------------
  onSubmit() {
    if (this.personalForm.invalid || this.fileError) {
      this.personalForm.markAllAsTouched();
      if (this.fileError) window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const fv = this.personalForm.value;

    // Build FormData matching EmployeePersonalDetailDto expected by controller
    const fd = new FormData();

    // required: RegionId, CompanyId, UserId
    fd.append('RegionId', String(this.regionId ?? 0));
    fd.append('CompanyId', String(this.companyId ?? 0));
    fd.append('UserId', String(this.userId ?? 0));

    // Form controls -> DTO mapping
    fd.append('FirstName', fv.firstName.trim());
    fd.append('LastName', fv.lastName.trim());
    fd.append('DateOfBirth', fv.dateOfBirth ? fv.dateOfBirth : ''); // controller binds DateTime?
    // gender: UI provides genderId as value (because you bound [value]="g.genderId")
    fd.append('GenderId', String(fv.gender ?? 0));
    fd.append('MobileNumber', fv.mobileNumber ?? '');
    fd.append('PersonalEmail', fv.personalEmail ?? '');
    fd.append('PermanentAddress', fv.permanentAddress ?? '');
    fd.append('PresentAddress', fv.presentAddress ?? '');
    fd.append('Pannumber', fv.panNumber ?? '');
    fd.append('AadhaarNumber', fv.aadhaarNumber ?? '');
    fd.append('PassportNumber', fv.passportNumber ?? '');
    fd.append('PlaceOfBirth', fv.placeOfBirth ?? '');
    fd.append('Uan', fv.uan ?? '');
    fd.append('BloodGroup', fv.bloodGroup ?? '');
    fd.append('Citizenship', fv.citizenship ?? '');
    fd.append('Religion', fv.religion ?? '');
    fd.append('DrivingLicence', fv.drivingLicence ?? '');

    // maritalStatus mapping: backend expects MaritalStatusId. We try to map name -> index+1 if possible.
    let maritalId = 0;
    if (fv.maritalStatus) {
      const idx = this.maritalNames.indexOf(fv.maritalStatus);
      if (idx >= 0) maritalId = idx + 1;
      // if mapping unknown, leave 0
    }
    fd.append('MaritalStatusId', String(maritalId));
    fd.append('MarriageDate', fv.marriageDate ?? '');
    fd.append('WorkPhone', fv.workPhone ?? '');
    fd.append('LinkedInProfile', fv.linkedInProfile ?? '');
    fd.append('PreviousExperienceText', fv.previousExperienceText ?? '');
    fd.append('PreviousExperienceYears', fv.previousExperienceYears != null ? String(fv.previousExperienceYears) : '');

    // optional: createdBy -> set to userId
    fd.append('CreatedBy', String(this.userId ?? 0));

    // File: ProfilePicture
    if (this.selectedFile) {
      fd.append('ProfilePicture', this.selectedFile, this.selectedFile.name);
    }

    // call service
    this.adminService.addPersonal(fd).subscribe({
      next: (res: any) => {
        // success: reload server list (preferred) and reset form
        alert(res?.message ?? 'Saved successfully');
        this.loadFromServer();
        this.resetForm();
      },
      error: (err) => {
        console.error('addPersonal error', err);
        alert('Failed to save. See console for details.');
      }
    });
  }

  // ---------------- Load server records ----------------
  loadFromServer() {
    this.adminService.getAllPersonal().subscribe({
      next: (res: any[]) => {
        if (!res || !Array.isArray(res)) {
          console.warn('getAllPersonal returned unexpected payload', res);
          return;
        }

        // Map backend DTO -> EmployeePersonal model for display
        this.records = res.map(dto => {
          // find gender name
          let genderName = '';
          // dto.GenderId or dto.genderId depending on API shape
          const gid = (dto as any).GenderId ?? (dto as any).genderId ?? (dto as any).gender ?? null;
          if (gid != null) {
            const gObj = this.genders.find(x => (x.genderId === gid) || (x.genderID === gid) || (x.genderId === Number(gid)));
            genderName = gObj ? (gObj.genderName ?? '') : String(gid);
          } else if ((dto as any).gender) {
            genderName = (dto as any).gender;
          }

          // marital name mapping
          let maritalName = '';
          const mid = (dto as any).MaritalStatusId ?? (dto as any).maritalStatusId ?? 0;
          if (mid && this.maritalNames && this.maritalNames.length >= mid) {
            maritalName = this.maritalNames[mid - 1];
          } else if ((dto as any).maritalStatus) {
            maritalName = (dto as any).maritalStatus;
          }

          // date fields: backend likely returns ISO string
          const dobIso = (dto as any).DateOfBirth ? new Date((dto as any).DateOfBirth).toISOString() : '';
          const marriageIso = (dto as any).MarriageDate ? new Date((dto as any).MarriageDate).toISOString() : '';

          return {
            id: (dto as any).Id ?? (dto as any).id ?? 0,
            firstName: (dto as any).FirstName ?? (dto as any).firstName ?? '',
            lastName: (dto as any).LastName ?? (dto as any).lastName ?? '',
            dateOfBirth: dobIso,
            gender: genderName as any,
            mobileNumber: (dto as any).MobileNumber ?? (dto as any).mobileNumber ?? '',
            personalEmail: (dto as any).PersonalEmail ?? (dto as any).personalEmail ?? '',
            permanentAddress: (dto as any).PermanentAddress ?? (dto as any).permanentAddress ?? '',
            presentAddress: (dto as any).PresentAddress ?? (dto as any).presentAddress ?? '',
            panNumber: (dto as any).Pannumber ?? (dto as any).panNumber ?? '',
            aadhaarNumber: (dto as any).AadhaarNumber ?? (dto as any).aadhaarNumber ?? '',
            profilePictureBase64: (dto as any).ProfilePictureBase64 ?? null,
            profilePictureName: (dto as any).ProfilePictureName ?? null,
            passportNumber: (dto as any).PassportNumber ?? null,
            placeOfBirth: (dto as any).PlaceOfBirth ?? null,
            uan: (dto as any).Uan ?? null,
            bloodGroup: (dto as any).BloodGroup ?? '',
            citizenship: (dto as any).Citizenship ?? null,
            religion: (dto as any).Religion ?? null,
            drivingLicence: (dto as any).DrivingLicence ?? null,
            maritalStatus: (maritalName as any) ?? '',
            marriageDate: marriageIso || undefined,
            workPhone: (dto as any).WorkPhone ?? undefined,
            linkedInProfile: (dto as any).LinkedInProfile ?? undefined,
            previousExperienceText: (dto as any).PreviousExperienceText ?? undefined,
            previousExperienceYears: (dto as any).PreviousExperienceYears ?? null,
            createdAt: (dto as any).CreatedAt ? new Date((dto as any).CreatedAt).toISOString() : new Date().toISOString(),
            modifiedAt: (dto as any).ModifiedAt ? new Date((dto as any).ModifiedAt).toISOString() : undefined
          } as EmployeePersonal;
        });

        // no longer using localStorage when server returns data (but kept save/load functions)
        this.saveRecords(); // optional: cache server data locally
      },
      error: (err) => {
        console.error('getAllPersonal error', err);
        // fallback: keep localStorage records already loaded
      }
    });
  }

  // ---------------- localStorage persistence (unchanged) ----------------
  private saveRecords() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.records));
    } catch (e) {
      console.error('saveRecords error', e);
    }
  }

  private loadRecords() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        this.records = JSON.parse(raw) as EmployeePersonal[];
      } else {
        this.records = [];
      }
    } catch (e) {
      console.error('loadRecords error', e);
      this.records = [];
    }
  }

  // ---------------- edit / delete / reset functions (unchanged except ensure marriageDate control) ----------------
  edit(item: EmployeePersonal) {
    this.editMode = true;
    this.editId = item.id;

    if (item.maritalStatus === 'Married') this.personalForm.get('marriageDate')?.enable({ emitEvent: false });

    this.personalForm.patchValue({
      firstName: item.firstName,
      lastName: item.lastName,
      dateOfBirth: item.dateOfBirth,
      gender: item.gender, // if this is a string (name) and your select expects ID, you may need to map back to id
      mobileNumber: item.mobileNumber,
      personalEmail: item.personalEmail,
      permanentAddress: item.permanentAddress,
      presentAddress: item.presentAddress,
      panNumber: item.panNumber,
      aadhaarNumber: item.aadhaarNumber,
      passportNumber: item.passportNumber,
      placeOfBirth: item.placeOfBirth,
      uan: item.uan,
      bloodGroup: item.bloodGroup,
      citizenship: item.citizenship,
      religion: item.religion,
      drivingLicence: item.drivingLicence,
      maritalStatus: item.maritalStatus,
      marriageDate: item.marriageDate ?? null,
      workPhone: item.workPhone,
      linkedInProfile: item.linkedInProfile,
      previousExperienceText: item.previousExperienceText,
      previousExperienceYears: item.previousExperienceYears
    });

    this.previewImage = item.profilePictureBase64 ?? null;
    this.profilePictureName = item.profilePictureName ?? null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  delete(id: number | undefined) {
    if (!id) return;
    if (!confirm('Are you sure to delete this record?')) return;
    this.records = this.records.filter(r => r.id !== id);
    this.saveRecords();
  }

  resetForm() {
    this.personalForm.reset();
    this.previewImage = null;
    this.profilePictureName = null;
    this.fileError = null;
    this.selectedFile = null;
    this.editMode = false;
    this.editId = null;
    this.personalForm.get('marriageDate')?.disable({ emitEvent: false });
  }

  // ---------------- sorting / filtering / pagination (unchanged) ----------------
  sortBy(column: keyof EmployeePersonal) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
  }

  private getSortedRecords(): EmployeePersonal[] {
    const data = [...this.records];
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

  filteredList(): EmployeePersonal[] {
    const s = (this.searchText ?? '').trim().toLowerCase();
    const data = this.getSortedRecords().filter(r => {
      if (!s) return true;
      const combined = `${r.firstName ?? ''} ${r.lastName ?? ''} ${r.personalEmail ?? ''} ${r.mobileNumber ?? ''}`.toLowerCase();
      return combined.includes(s);
    });
    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  get filteredCount(): number {
    const s = (this.searchText ?? '').trim().toLowerCase();
    return this.getSortedRecords().filter(r => {
      if (!s) return true;
      const combined = `${r.firstName ?? ''} ${r.lastName ?? ''} ${r.personalEmail ?? ''} ${r.mobileNumber ?? ''}`.toLowerCase();
      return combined.includes(s);
    }).length;
  }

  get showingRange(): string {
    const total = this.filteredCount;
    if (total === 0) return '0–0';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    let end = this.currentPage * this.pageSize;
    if (end > total) end = total;
    return `${start}–${end}`;
  }

  get totalPages(): number {
    const total = this.filteredCount;
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

  // helper to display DD/MM/YYYY
  formatDateForDisplay(iso: string | undefined | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
}