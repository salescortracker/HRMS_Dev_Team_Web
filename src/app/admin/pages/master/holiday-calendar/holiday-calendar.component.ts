import { Component } from '@angular/core';
import { Holiday } from '../../../layout/models/holiday-calendar.model';
@Component({
  selector: 'app-holiday-calendar',
  standalone: false,
  templateUrl: './holiday-calendar.component.html',
  styleUrl: './holiday-calendar.component.css'
})
export class HolidayCalendarComponent {
holiday: Holiday = { HolidayDate: '', HolidayName: '', HolidayType: '', Description: '', IsActive: true };
  holidays: Holiday[] = [];
  isEditMode = false;
  searchText = '';

  currentPage = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.loadHolidays();
  }

  loadHolidays() {
    // Sample data – replace with API call
    this.holidays = [
      { HolidayID: 1, HolidayDate: '2025-01-01', HolidayName: 'New Year', HolidayType: 'Public', IsActive: true },
      { HolidayID: 2, HolidayDate: '2025-08-15', HolidayName: 'Independence Day', HolidayType: 'Public', IsActive: true },
      { HolidayID: 3, HolidayDate: '2025-10-02', HolidayName: 'Gandhi Jayanti', HolidayType: 'Public', IsActive: true }
    ];
  }

  onSubmit() {
    if (this.isEditMode) {
      const index = this.holidays.findIndex(h => h.HolidayID === this.holiday.HolidayID);
      if (index !== -1) this.holidays[index] = { ...this.holiday };
    } else {
      const newId = this.holidays.length + 1;
      this.holidays.push({ HolidayID: newId, ...this.holiday });
    }
    this.resetForm();
  }

  editHoliday(h: Holiday) {
    this.isEditMode = true;
    this.holiday = { ...h };
  }

  deleteHoliday(h: Holiday) {
    this.holidays = this.holidays.filter(x => x.HolidayID !== h.HolidayID);
  }

  resetForm() {
    this.holiday = { HolidayDate: '', HolidayName: '', HolidayType: '', Description: '', IsActive: true };
    this.isEditMode = false;
  }

  // Filtering + Pagination
  filteredHolidays() {
    return this.holidays.filter(h =>
      h.HolidayName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  paginatedHolidays() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredHolidays().slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.filteredHolidays().length / this.pageSize);
  }

  pagesArray() {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) this.currentPage = page;
  }
}
