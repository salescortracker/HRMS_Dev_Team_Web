import { Component, OnInit } from '@angular/core';
import { AdminService, UserDropdown } from '../../../admin/servies/admin.service';

export interface LateArrivalRecord {
  employeeCode?: string;
  employeeName?: string;
  fullName?: string;
  department?: string;
  attendanceDate?: string;
  minutesLate?: number;
  shiftName?: string;
  clockInOutId?: number;
  scheduledStartTime?: string;
  clockInTime?: string;
}

@Component({
  selector: 'app-late-arrivals',
  standalone: false,
  templateUrl: './late-arrivals.component.html',
  styleUrls: ['./late-arrivals.component.css']
})
export class LateArrivalsComponent implements OnInit {
  employees: UserDropdown[] = [];
  loading = false;
  loadingEmployees = false;
  error: string | null = null;
  selectedEmployeeCode: string = '';
  fromDate: string = '';
  toDate: string = '';
  userId!: number;
  companyId!: number;
  regionId!: number;
  currentUser: any ;
  // debug props
  lastApiError: any = null;
  lastRawResponse: any = null;
  
  lateArrivals: LateArrivalRecord[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.currentUser =(sessionStorage.getItem("currentUser")); 
    if (this.currentUser) {
    try {
      const currentUser = JSON.parse(this.currentUser);
      this.userId = currentUser.userId;
      this.companyId = currentUser.companyId;
      this.regionId = currentUser.regionId;
      
      console.log('Parsed user data:', {
        userId: this.userId,
        companyId: this.companyId,
        regionId: this.regionId,
        fullName: currentUser.fullName,
        roleName: currentUser.roleName
      });
    } catch (error) {
      console.error('Error parsing currentUser JSON:', error);
      this.error = 'Error loading user data. Please login again.';
      return;
    }
  } 
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
    this.fetchEmployees();

    console.log('Initializing LateArrivalsComponent', {
      userId: this.userId,
      companyId: this.companyId,
      regionId: this.regionId
    });

    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
      this.error = "User ID not found. Please login again.";
      return;
    }

    this.setDefaultDates();
    this.fetchEmployees();
  }

  setDefaultDates(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    this.toDate = this.formatDate(today);
    this.fromDate = this.formatDate(thirtyDaysAgo);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  fetchEmployees(): void {

    if (!this.userId) {
      console.error('fetchEmployees aborted: UserId is invalid', this.userId);
      this.error = 'User ID is missing or invalid. Please login again.';
      return;
    }

    this.loadingEmployees = true;
    this.error = null;
    this.lastApiError = null;
    this.lastRawResponse = null;

    console.log('Calling getUsersByReportingTo with userId:', this.userId);

    this.adminService.getUsersByReportingTo(this.userId).subscribe({
      next: (data: UserDropdown[]) => {
        console.log('API Response received:', data);
        this.lastRawResponse = data;
        this.employees = Array.isArray(data) ? data : [];
        this.loadingEmployees = false;
        
        if (this.employees.length === 0) {
          console.warn('No employees returned for reportingTo:', this.userId);
          this.error = 'No employees found under your supervision.';
        } else {
          console.log(`Loaded ${this.employees.length} employees`);
          // Auto-select the first employee if none selected
          // if (!this.selectedEmployeeCode && this.employees.length > 0) {
          //   this.selectedEmployeeCode = this.employees[0].employeeCode;
          // }
        }
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        this.lastApiError = err;
        this.employees = [];
        this.loadingEmployees = false;
        
        let message = 'Failed to load employees';
        if (err?.status === 404) {
          message = 'No employees found for the specified manager';
        } else if (err?.status === 401) {
          message = 'Authentication failed. Please login again.';
        } else if (err?.status) {
          message += ` (Status: ${err.status})`;
        }
        
        if (err?.error?.message) {
          message += `: ${err.error.message}`;
        }
        
        this.error = message;
      }
    });
  }

  // For debugging in template
  // getEmployeesDebugInfo(): string {
  //   if (this.loadingEmployees) return 'Loading...';
  //   if (this.employees.length === 0) return 'No employees loaded';
  //   return `${this.employees.length} employees loaded. First: ${this.employees[0]?.fullName}`;
  // }

  formatTime(time: string | null): string {
    if (!time) return '--';
    const parts = time.split(':');
    if (parts.length < 2) return time;
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }

 onFilterClick(): void {
debugger
  if (!this.fromDate || !this.toDate) {
    this.error = 'Please select both From Date and To Date';
    return;
  }

  this.loading = true;
  this.error = null;
  this.lateArrivals = [];

  console.log('Calling Late Arrivals API with:', {
    companyId: this.companyId,
    regionId: this.regionId,
    fromDate: this.fromDate,
    toDate: this.toDate,
    employeeCode: this.selectedEmployeeCode || 'ALL'
  });

  this.adminService.getLateArrivals(
    this.companyId,
    this.regionId,
    this.fromDate,
    this.toDate,
    this.selectedEmployeeCode || undefined
  ).subscribe({
    next: (data) => {
      console.log('Late arrivals received:', data);

      this.lateArrivals = data.map(r => ({
        ...r,
        scheduledStartTime: this.formatTime(r.scheduledStartTime ?? null),
        clockInTime: this.formatTime(r.clockInTime ?? null)
      }));

      this.loading = false;

      if (this.lateArrivals.length === 0) {
        this.error = 'No late arrival records found for selected filters.';
      }
    },
    error: (err) => {
      console.error('Late arrivals API error:', err);
      this.error = 'Failed to load late arrival records';
      this.loading = false;
    }
  });
}

}