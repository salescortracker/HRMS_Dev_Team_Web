import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AdminService } from '../../../admin/servies/admin.service';

interface AttendanceRecord {
  attendanceDate: string;
  employeeName: string;
  department: string;
  actionType: string;
  actionTime: string;
  departments:string;
}

@Component({
  selector: 'app-clockin-clockout',
  standalone: false,
  templateUrl: './clockin-clockout.component.html',
  styleUrl: './clockin-clockout.component.css'
})
export class ClockinClockoutComponent implements OnInit {
 attendanceForm!: FormGroup;
  attendanceRecords: AttendanceRecord[] = [];
  attendanceRecord:any;
  currentUser: any;
  loading = false;
  message = '';
  todayClockIn = '--:--';
  todayClockOut = '--:--';
  todayDuration = '--:--';
currentUserRoleId :any;
  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadSessionUser();
    this.initForm();
    this.patchEmployeeData();
    this.loadAttendance();
  }

  initForm() {
    this.attendanceForm = this.fb.group({
      employeeCode: [{ value: '', disabled: true }, Validators.required],
      employeeName: [{ value: '', disabled: true }, Validators.required],
      department: [{ value: '', disabled: true }, Validators.required],
      clockType: ['', Validators.required],
      time: ['', Validators.required]
    });
  }

  patchEmployeeData() {
    if (!this.currentUser) return;
    this.attendanceForm.patchValue({
      employeeCode: this.currentUser.userId,
      employeeName: this.currentUser.fullName,
      department: this.currentUser.roleName,
    });
     this.currentUserRoleId = this.currentUser.roleId; 
  }

  onSubmit() {
    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }

    const form = this.attendanceForm.getRawValue();
    const payload = {
      regionId: this.currentUser.regionId,
      companyId: this.currentUser.companyId,
      employeeCode: String(this.currentUser.userId),
      employeeName: form.employeeName,
      department: this.currentUserRoleId,
      attendanceDate: new Date(),
      actionType: form.clockType,
      actionTime: form.time
    };

    this.loading = true;
    this.message = '';
    this.adminService.createClockInOut(payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.message = 'Attendance saved successfully';
          this.attendanceForm.patchValue({ clockType: '', time: '' });
          this.attendanceForm.get('clockType')?.markAsUntouched();
      this.attendanceForm.get('time')?.markAsUntouched();
      this.attendanceForm.get('clockType')?.markAsPristine();
      this.attendanceForm.get('time')?.markAsPristine();
          this.loadAttendance();
        },
        error: () => this.message = 'Failed to save attendance'
      });
  }

  loadAttendance() {
    if (!this.currentUser) return;

    this.adminService.getTodayAttendance(
      String(this.currentUser.userId),
      this.currentUser.companyId,
      this.currentUser.regionId
    ).subscribe(res => {
      this.attendanceRecords = res;
      this.attendanceRecord = res;
      this.setTodaySummary();
    });
  }

  parseTime(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  setTodaySummary() {
    const today = new Date().toLocaleDateString('en-CA'); // yyyy-MM-dd

    const todayRecords = this.attendanceRecords
      .filter(r => r.attendanceDate.startsWith(today))
      .sort((a, b) => a.actionTime.localeCompare(b.actionTime));

    const clockIns = todayRecords.filter(r => r.actionType === 'ClockIn');
    const clockOuts = todayRecords.filter(r => r.actionType === 'ClockOut');

    this.todayClockIn = clockIns.length ? clockIns[0].actionTime : '--:--';
    this.todayClockOut = clockOuts.length ? clockOuts[clockOuts.length - 1].actionTime : '--:--';

    if (this.todayClockIn !== '--:--' && this.todayClockOut !== '--:--') {
      const start = this.parseTime(this.todayClockIn);
      const end = this.parseTime(this.todayClockOut);
      const diffMs = end.getTime() - start.getTime();

      if (diffMs > 0) {
        const h = Math.floor(diffMs / 3600000);
        const m = Math.floor((diffMs % 3600000) / 60000);
        this.todayDuration = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
      } else {
        this.todayDuration = '--:--';
      }
    } else {
      this.todayDuration = '--:--';
    }
  }

  loadSessionUser() {
    const user = sessionStorage.getItem('currentUser');
    if (user) this.currentUser = JSON.parse(user);
  }
}
