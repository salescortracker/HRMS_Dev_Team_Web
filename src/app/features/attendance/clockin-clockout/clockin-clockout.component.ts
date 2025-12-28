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
  currentUser: any;
  loading = false;
  message = '';
  todayClockIn = '--:--';
  todayClockOut = '--:--';
  availableActions: string[] = [];
todayDuration = '--:--';

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
      department: this.currentUser.roleId,
    });
  }
  setAvailableActions() {
  const today = new Date().toISOString().split('T')[0];

  const todayRecords = this.attendanceRecords
    .filter(r => r.attendanceDate.startsWith(today))
    .sort((a, b) => a.actionTime.localeCompare(b.actionTime));

  // FIRST record of the day
  if (todayRecords.length === 0) {
    this.availableActions = ['ClockIn'];
    this.attendanceForm.patchValue({ clockType: 'ClockIn' });
    return;
  }

  // LAST record decides next action
  const lastAction = todayRecords[todayRecords.length - 1].actionType;

  if (lastAction === 'ClockIn') {
    this.availableActions = ['ClockOut'];
    this.attendanceForm.patchValue({ clockType: 'ClockOut' });
  } else {
    this.availableActions = ['ClockIn'];
    this.attendanceForm.patchValue({ clockType: 'ClockIn' });
  }
}


  onSubmit() {
    // if (this.attendanceForm.invalid) return;
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
      // department: form.department,
      department: String(form.department), // OR actual department name
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
          this.loadAttendance();
          this.ngOnInit();  
        },
        error: () => this.message = 'Failed to save attendance'
      });
  }

  loadAttendance() {
    this.adminService.getTodayAttendance(
      String(this.currentUser.userId),
      this.currentUser.companyId,
      this.currentUser.regionId
    ).subscribe(res => {
      this.attendanceRecords = res;
      this.setTodaySummary();
      this.setAvailableActions(); 
    });
  }

  parseTime(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

   setTodaySummary() {
  const today = new Date().toISOString().split('T')[0];

  const todayRecords = this.attendanceRecords
    .filter(r => r.attendanceDate.startsWith(today))
    .sort((a, b) => a.actionTime.localeCompare(b.actionTime));

  const clockIns = todayRecords.filter(r => r.actionType === 'ClockIn');
  const clockOuts = todayRecords.filter(r => r.actionType === 'ClockOut');

  // First ClockIn
  this.todayClockIn = clockIns.length
    ? clockIns[0].actionTime
    : '--:--';

  // Last ClockOut
  this.todayClockOut = clockOuts.length
    ? clockOuts[clockOuts.length - 1].actionTime
    : '--:--';

  // 🟢 Calculate duration
  if (this.todayClockIn !== '--:--' && this.todayClockOut !== '--:--') {
    const start = this.parseTime(this.todayClockIn);
    const end = this.parseTime(this.todayClockOut);

    const diffMs = end.getTime() - start.getTime();

    if (diffMs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      this.todayDuration =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
