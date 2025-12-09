import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, ShiftAllocationDto, ShiftMasterDto, UserReadDto } from '../../../admin/servies/admin.service';
import { formatDate } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-shift-allocation',
  templateUrl: './shift-allocation.component.html',
  standalone: false,
  styleUrls: ['./shift-allocation.component.css']
})
export class ShiftAllocationComponent implements OnInit {
  shiftForm!: FormGroup;
  employees: UserReadDto[] = [];
  shifts: ShiftMasterDto[] = [];
  allocations: ShiftAllocationDto[] = [];

  editMode = false;
  editId: number | null = null;

  todayStr = '';
  loading = true;

  currentUserId: number = 0;
  currentUserCompanyId: number = 0;
  currentUserRegionId: number = 0;

  constructor(private fb: FormBuilder, private svc: AdminService) {
    this.todayStr = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    
    this.currentUserId = +(sessionStorage.getItem('UserId') || '0');
    this.currentUserCompanyId = +(sessionStorage.getItem('CompanyId') || '0');
    this.currentUserRegionId = +(sessionStorage.getItem('RegionId') || '0');
  }

  ngOnInit(): void {
    this.initForm();
    this.loadLookups();
    this.loadAllocations();
  }

  initForm() {
    this.shiftForm = this.fb.group({
      userID: ['', Validators.required],
      employeeCode: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(20)]],
      shiftID: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      isActive: [true]
    });
  }

  loadLookups() {
    this.svc.getAllUsers().subscribe(
      r => {
        this.employees = r.map(u => ({
          companyID: u.companyId || 0,
          regionID: u.regionId || 0,
          userID:  u.UserID || 0,
          employeeCode: u.employeeCode || '',
          fullName: u.fullName || '',
          email: u.email || '',
          status: u.status || '',
          roleName: (u.roleId !== undefined && u.roleId !== null) ? u.roleId.toString() : ''
        }));
      }, 
      err => {
        console.error('Error loading users:', err);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to load employees. Please try again'
        });
      }
    );

    this.svc.getAllShifts().subscribe(
      r => this.shifts = r, 
      err => console.error('Error loading shifts:', err)
    );
  }

  loadAllocations() {
    this.loading = true;
    this.svc.getAllAllocations().subscribe(
      r => {
        this.allocations = (r || []).slice().sort((a, b) => {
          const da = a.startDate ? new Date(a.startDate).getTime() : 0;
          const db = b.startDate ? new Date(b.startDate).getTime() : 0;
          return db - da;
        });
        this.loading = false;
        console.log('Loaded allocations:', this.allocations);
      }, 
      err => {
        console.error('Error loading allocations:', err);
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to load shift allocations'
        });
      }
    );
  }

  onEmployeeChange() {
    const selectedUserId = this.shiftForm.get('userID')?.value;
    if (!selectedUserId) return;

    const user = this.employees.find(e => e.userID === selectedUserId);
    if (!user) {
      console.error('User not found with ID:', selectedUserId);
      console.log('Available employees:', this.employees);
      return;
    }

    console.log('Selected user:', user);

    this.shiftForm.patchValue({
      employeeCode: user.employeeCode,
      userID: user.userID,
      fullName: user.fullName,
      companyID: user.companyID,
      regionID: user.regionID
    });
  }

  validateDatesAndOverlap(dtoCandidate: ShiftAllocationDto): { ok: boolean; message?: string } {
    const start = dtoCandidate.startDate ? new Date(dtoCandidate.startDate) : null;
    const end = dtoCandidate.endDate ? new Date(dtoCandidate.endDate) : null;
    const today = new Date(this.todayStr);

    if (!start) return { ok: false, message: 'Start Date is required' };
    if (start < today) return { ok: false, message: 'Start date cannot be earlier than today' };
    if (end && end < start) return { ok: false, message: 'End date must be same or after Start date' };

    const sameUserAllocs = this.allocations.filter(a => 
      a.userID === dtoCandidate.userID && 
      (this.editMode ? a.shiftAllocationId !== this.editId : true)
    );
    
    for (const a of sameUserAllocs) {
      const aStart = a.startDate ? new Date(a.startDate) : null;
      const aEnd = a.endDate ? new Date(a.endDate) : null;
      const overlaps = this.rangesOverlap(aStart, aEnd, start!, end || null);
      if (overlaps) {
        return { 
          ok: false, 
          message: `Overlaps with existing assignment (${a.shiftName || 'Shift'}) from ${aStart ? formatDate(aStart,'yyyy-MM-dd','en-US') : 'N/A'} to ${aEnd ? formatDate(aEnd,'yyyy-MM-dd','en-US') : 'Ongoing'}` 
        };
      }
    }
    return { ok: true };
  }

  rangesOverlap(aStart: Date | null, aEnd: Date | null, bStart: Date, bEnd: Date | null): boolean {
    const aS = aStart ? aStart.getTime() : Number.MIN_SAFE_INTEGER;
    const aE = aEnd ? aEnd.getTime() : Number.MAX_SAFE_INTEGER;
    const bS = bStart ? bStart.getTime() : Number.MIN_SAFE_INTEGER;
    const bE = bEnd ? bEnd.getTime() : Number.MAX_SAFE_INTEGER;
    return (aS <= bE && bS <= aE);
  }

  onSubmit() {
    if (this.shiftForm.invalid) {
    
      this.shiftForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Please fill all required fields'
      });
      return;
    }

    const raw = this.shiftForm.getRawValue();
    const selectedUserId = +raw.userID;
    
    const selectedEmployee = this.employees.find(e => e.userID === selectedUserId);
    
    if (!selectedEmployee) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Selected employee not found'
      });
      return;
    }

    const createdByUserId = this.currentUserId;
    
    if (!createdByUserId || createdByUserId === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'User session not found. Please login again.'
      });
      return;
    }

    const dto: ShiftAllocationDto = {
      shiftAllocationId: this.editMode && this.editId ? this.editId : 0,
      userID: createdByUserId,      
      employeeCode: selectedEmployee.employeeCode || '',
      fullName: selectedEmployee.fullName || '',
      companyID: selectedEmployee.companyID || 0,
      regionID: selectedEmployee.regionID || 0,
      shiftID: +raw.shiftID,
      shiftName: this.shifts.find(s => s.shiftID === +raw.shiftID)?.shiftName || '',
      startDate: raw.startDate,
      endDate: raw.endDate || null,
      isActive: raw.isActive,
      createdBy: createdByUserId, 
      createdDate: new Date().toISOString() 
    };

    const check = this.validateDatesAndOverlap(dto);
    if (!check.ok) {
      Swal.fire({
        icon: 'warning',
        title: 'Overlap Detected',
        text: check.message
      });
      return;
    }

    if (!this.editMode) {
      this.svc.allocateShift(dto).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Shift assigned successfully',
            timer: 2000,
            showConfirmButton: false
          });
          this.resetForm();
          this.loadAllocations();
        },
        error: (err) => {
          console.error('Create Error:', err);
          let msg = 'Failed to create allocation';
          if (typeof err?.error === 'string') {
            msg = err.error;
          } else if (err?.error?.message) {
            msg = err.error.message;
          } else if (err?.error) {
            msg = JSON.stringify(err.error);
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: msg
          });
          this.loadAllocations();
        }
      });
      return;
    }

    if (!this.editId) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Cannot update: No allocation ID found'
      });
      return;
    }

    this.svc.updateAllocation(dto).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Allocation updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
        this.resetForm();
        this.loadAllocations();
      },
      error: (err) => {
        console.error('Update Error:', err);
        if (err.status === 200 || err.status === 204) {
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Allocation updated successfully',
            timer: 2000,
            showConfirmButton: false
          });
          this.resetForm();
          this.loadAllocations();
          return;
        }
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Failed to update allocation'
        });
      }
    });
  }

  onEdit(a: ShiftAllocationDto) {
    this.editMode = true;
    this.editId = a.shiftAllocationId || null;
    
    this.shiftForm.patchValue({
      userID: a.userID,
      employeeCode: a.employeeCode,
      shiftID: a.shiftID,
      startDate: a.startDate ? (a.startDate as string).split('T')[0] : '',
      endDate: a.endDate ? (a.endDate as string).split('T')[0] : '',
      isActive: a.isActive
    });

    if (a.companyID) sessionStorage.setItem('CompanyId', a.companyID.toString());
    if (a.regionID) sessionStorage.setItem('RegionId', a.regionID.toString());
    if (a.userID) sessionStorage.setItem('UserId', a.userID.toString());
  }
onDelete(id?: number) {
  if (!id || id === 0) return;

  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel!',
  }).then((result) => {
    if (result.isConfirmed) {
      this.svc.deleteAllocation(id).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Shift deleted successfully',
            timer: 1500,
            showConfirmButton: false
          });
          // reload allocations after delete
          this.loadAllocations();
        },
        error: (err) => {
          console.error('Delete API error:', err);
          // handle if backend sends 204
          if (err.status === 204 || err.status === 200) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Shift deleted successfully',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadAllocations();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: 'Delete failed'
            });
          }
        }
      });
    }
  });
}


  resetForm() {
    this.editMode = false;
    this.editId = null;
    this.shiftForm.reset({ isActive: true });
  }

  getStatus(a: ShiftAllocationDto): 'Active' | 'Inactive' {
    const today = new Date(this.todayStr);
    const s = a.startDate ? new Date(a.startDate) : null;
    const e = a.endDate ? new Date(a.endDate) : null;
    return (s && s <= today && (!e || e >= today)) ? 'Active' : 'Inactive';
  }
}
