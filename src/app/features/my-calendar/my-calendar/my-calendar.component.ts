import { Component } from '@angular/core';
interface CalendarItem {
  date: string; // YYYY-MM-DD
  type: 'event' | 'holiday' | 'optionalHoliday' | 'birthday' | 'workAnniversary' | 'leave';
  title: string;
}
@Component({
  selector: 'app-my-calendar',
  standalone: false,
  templateUrl: './my-calendar.component.html',
  styleUrl: './my-calendar.component.css'
})
export class MyCalendarComponent {
today = new Date();
  currentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();

  // Legend toggles
  showEvents = true;
  showHolidays = true;
  showOptionalHolidays = true;
  showBirthdays = true;
  showWorkAnniversaries = true;
  showLeaves = true;

  // Dummy calendar data
  items: CalendarItem[] = [
    { date: `${this.currentYear}-10-05`, type: 'holiday', title: 'Diwali' },
    { date: `${this.currentYear}-10-12`, type: 'birthday', title: 'John Birthday' },
    { date: `${this.currentYear}-10-15`, type: 'event', title: 'Annual Meet' },
    { date: `${this.currentYear}-10-18`, type: 'workAnniversary', title: 'Anita Work Anniversary' },
    { date: `${this.currentYear}-10-20`, type: 'leave', title: 'EMP001 - Sick Leave' },
    { date: `${this.currentYear}-10-25`, type: 'optionalHoliday', title: 'Optional Holiday' }
  ];

  // Generate days for current month
  getDaysInMonth(): Date[] {
    const date = new Date(this.currentYear, this.currentMonth, 1);
    const days = [];
    while (date.getMonth() === this.currentMonth) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }

  // Filter items by date and selected toggles
  getItemsForDate(date: Date): CalendarItem[] {
    return this.items.filter(item => {
      const matchDate = item.date === date.toISOString().split('T')[0];
      const matchType =
        (item.type === 'event' && this.showEvents) ||
        (item.type === 'holiday' && this.showHolidays) ||
        (item.type === 'optionalHoliday' && this.showOptionalHolidays) ||
        (item.type === 'birthday' && this.showBirthdays) ||
        (item.type === 'workAnniversary' && this.showWorkAnniversaries) ||
        (item.type === 'leave' && this.showLeaves);
      return matchDate && matchType;
    });
  }

  // Month name
  getMonthName() {
    return this.today.toLocaleString('default', { month: 'long' });
  }
}
