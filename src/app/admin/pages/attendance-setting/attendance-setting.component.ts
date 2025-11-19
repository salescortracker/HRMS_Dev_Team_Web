import { Component } from '@angular/core';
import { AttendanceSetting } from '../../layout/models/attendance-settings.mode';
@Component({
  selector: 'app-attendance-setting',
  standalone: false,
  templateUrl: './attendance-setting.component.html',
  styleUrl: './attendance-setting.component.css'
})
export class AttendanceSettingComponent {
searchText: string = '';
  pageSize: number = 5;
  currentPage: number = 1;
  isEditMode: boolean = false;

  newSetting: AttendanceSetting = {
    id: 0,
    shiftName: '',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriod: 0,
    overtimeAllowed: false,
    isActive: true
  };

  settings: AttendanceSetting[] = [
    { id: 1, shiftName: 'Morning Shift', startTime: '09:00', endTime: '18:00', gracePeriod: 15, overtimeAllowed: true, isActive: true },
    { id: 2, shiftName: 'Evening Shift', startTime: '14:00', endTime: '22:00', gracePeriod: 10, overtimeAllowed: false, isActive: true }
  ];

  addOrUpdateSetting() {
    if(this.isEditMode){
      const index = this.settings.findIndex(s => s.id === this.newSetting.id);
      if(index > -1) this.settings[index] = { ...this.newSetting };
    } else {
      this.newSetting.id = this.settings.length + 1;
      this.settings.push({ ...this.newSetting });
    }
    this.resetForm();
  }

  editSetting(setting: AttendanceSetting) {
    this.newSetting = { ...setting };
    this.isEditMode = true;
  }

  deleteSetting(setting: AttendanceSetting) {
    this.settings = this.settings.filter(s => s.id !== setting.id);
  }

  resetForm() {
    this.newSetting = {
      id: 0,
      shiftName: '',
      startTime: '09:00',
      endTime: '18:00',
      gracePeriod: 0,
      overtimeAllowed: false,
      isActive: true
    };
    this.isEditMode = false;
  }

  filteredSettings() {
    return this.settings.filter(s => s.shiftName.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  totalPages() {
    return Math.ceil(this.filteredSettings().length / this.pageSize);
  }

  pagesArray() {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  paginatedSettings() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSettings().slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if(page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
  }
}
