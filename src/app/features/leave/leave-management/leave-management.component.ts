import { Component } from '@angular/core';
interface Leave {
  date: string;  // yyyy-mm-dd
  type: string;
}
@Component({
  selector: 'app-leave-management',
  standalone: false,
  templateUrl: './leave-management.component.html',
  styleUrl: './leave-management.component.css'
})
export class LeaveManagementComponent {
 currentDate: Date = new Date();
  selectedView: 'month' | 'week' | 'day' = 'month';
  currentMonth: number = this.currentDate.getMonth();
  currentYear: number = this.currentDate.getFullYear();
  dates: { dateStr: string, day: string }[] = [];
  weeks: (number | null)[][] = [];

  employees: string[] = ['John Doe', 'Jane Smith', 'Alice Brown'];
  selectedEmployee: string = 'John Doe';

  // Sample leave data
  leaveData: { [employee: string]: Leave[] } = {
    'John Doe': [
      { date: '2025-10-15', type: 'Sick Leave' },
      { date: '2025-10-18', type: 'Casual Leave' }
    ],
    'Jane Smith': [
      { date: '2025-10-16', type: 'Paid Leave' }
    ],
    'Alice Brown': [
      { date: '2025-10-20', type: 'Sick Leave' }
    ]
  };

  ngOnInit(): void {
    this.generateMonthDates(this.currentYear, this.currentMonth);
  }

  // =================== Month View ===================
  generateMonthDates(year: number, month: number) {
    this.weeks = [];
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    let day = 1 - firstDay;

    for (let w = 0; w < 6; w++) {
      const week: (number | null)[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(day > 0 && day <= lastDate ? day : null);
        day++;
      }
      this.weeks.push(week);
    }
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else this.currentMonth--;
    this.generateMonthDates(this.currentYear, this.currentMonth);
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else this.currentMonth++;
    this.generateMonthDates(this.currentYear, this.currentMonth);
  }

  // =================== Week View ===================
  getWeekDates(startDate: Date): { dateStr: string, day: string }[] {
    const week: { dateStr: string, day: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const day = d.toLocaleString('en-US', { weekday: 'short' });
      const dateStr = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
      week.push({ dateStr, day });
    }
    return week;
  }

  // =================== Day View ===================
  getDayLeaves(date: string| null): Leave[] {
    return this.leaveData[this.selectedEmployee]?.filter(l => l.date === date) || [];
  }

  // =================== Utilities ===================
  isToday(day: number | null): boolean {
    if (!day) return false;
    return day === this.currentDate.getDate() &&
           this.currentMonth === this.currentDate.getMonth() &&
           this.currentYear === this.currentDate.getFullYear();
  }

  hasLeave(day: number | null): string | null {
    if (!day) return null;
    const dateStr = `${this.currentYear}-${(this.currentMonth+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
    const leave = this.leaveData[this.selectedEmployee]?.find(l => l.date === dateStr);
    return leave ? leave.type : null;
  }
}
