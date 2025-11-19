import { Component } from '@angular/core';
import { AttendanceConfig } from '../../../layout/models/attendance-configuration.model';
@Component({
  selector: 'app-attendance-configuration',
  standalone: false,
  templateUrl: './attendance-configuration.component.html',
  styleUrl: './attendance-configuration.component.css'
})
export class AttendanceConfigurationComponent {
 attendance: AttendanceConfig = this.defaultConfig();
  attendanceList: AttendanceConfig[] = [];
  searchText = '';
  isEditMode = false;
  editIndex = -1;

  attendanceModes = ['Manual', 'Biometric', 'Geo-Tag', 'Web Punch'];
  overtimeOptions = ['Manual', 'Automatic', 'Not Applicable'];

  ngOnInit(): void {}

  defaultConfig(): AttendanceConfig {
    return {
      Mode: '',
      GracePeriod: 0,
      LateMarkThreshold: 0,
      EarlyLeaveThreshold: 0,
      ShiftRequired: false,
      AutoAbsent: false,
      OvertimeCalc: '',
      Description: ''
    };
  }

  onSubmit() {
    if (this.isEditMode) {
      this.attendanceList[this.editIndex] = { ...this.attendance };
      this.isEditMode = false;
      this.editIndex = -1;
    } else {
      this.attendanceList.push({ ...this.attendance });
    }
    this.resetForm();
  }

  editConfig(config: AttendanceConfig) {
    this.attendance = { ...config };
    this.isEditMode = true;
    this.editIndex = this.attendanceList.indexOf(config);
  }

  deleteConfig(index: number) {
    if (confirm('Are you sure you want to delete this configuration?')) {
      this.attendanceList.splice(index, 1);
    }
  }

  filteredConfigs() {
    if (!this.searchText) return this.attendanceList;
    return this.attendanceList.filter(c =>
      c.Mode.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  resetForm() {
    this.attendance = this.defaultConfig();
    this.isEditMode = false;
  }
}
