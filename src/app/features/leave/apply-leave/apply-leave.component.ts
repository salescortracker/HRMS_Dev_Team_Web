import { Component, OnInit } from '@angular/core';
import { LeaveRequest } from '../../../admin/layout/models/apply-leave.model';
import { LeaveService } from '../services/leave.service';
import Swal from 'sweetalert2';
import { environment } from '../../environment/environment';

@Component({
  selector: 'app-apply-leave',
  standalone: false,
  templateUrl: './apply-leave.component.html',
  styleUrl: './apply-leave.component.css'
})
export class ApplyLeaveComponent implements OnInit {
// FORM FIELDS
  startDate: string = "";
  endDate: string = "";
  totalDays: number = 0;
  today: string = "";
  startDateError: string = "";
  endDateError: string = "";
  reason: string = "";
  leaveType: string = "";
  selectedFileName: string = "";
  reportingManager: string = '';
  isHalfDay: boolean = false;

  // LEAVE COUNTS
sickTotal: number = 1;
casualTotal: number = 1;

sickUsed: number = 0;
casualUsed: number = 0;

sickAvailable: number = 0;
casualAvailable: number = 0;

leaveTypes: any[] = [];


 userId!: number;
  companyId!: number;
  regionId!: number;
  reportingManagerName: string = '';
reportingManagerId!: number;
selectedFile!: File | null;

// Sorting
sortColumn: keyof LeaveRequest | null = null;
sortDirection: 'asc' | 'desc' = 'asc';

// Pagination
pageSize = 5;
currentPage = 1;
pageSizeOptions = [5, 10, 20, 50];

// Filters
searchText = '';

  // STATIC LEAVE LIST
  leaveList: LeaveRequest[] = [];

  ngOnInit(): void {
    this.today = this.formatDate(new Date());
  //   this.leaveList = [];
  // this.calculateLeaveSummary();
  //  this.loadLeaveTypes();
  // this.loadMyLeaves();

   this.userId = Number(sessionStorage.getItem("UserId"));
  this.companyId = Number(sessionStorage.getItem("CompanyId"));
  this.regionId = Number(sessionStorage.getItem("RegionId"));

  if (!this.userId) {
    console.error("UserId missing in sessionStorage");
    return;
  }
   this.leaveList = [];
  this.calculateLeaveSummary();
   this.loadLeaveTypes();
  this.loadMyLeaves();
  this.loadReportingManager();

  }

  constructor(private leaveService: LeaveService) {}

validateLeaveLimit() {
  let available = 0;

  if (this.leaveType === "Sick Leave") {
    available = this.sickAvailable;
  }

  if (this.leaveType === "Casual Leave") {
    available = this.casualAvailable;
  }

  // If half day -> allow only if available >= 0.5
  if (this.isHalfDay) {
    if (available < 0.5) {
      Swal.fire("Not Allowed", "You do not have enough leave balance.", "warning");
      this.totalDays = 0;
      this.endDate = "";
    }
    return;
  }

  // If applying full leave days
  if (this.totalDays > available) {
    Swal.fire(
      "Not Allowed",
      `You only have ${available} days available.`,
      "warning"
    );

    this.totalDays = 0;
    this.endDate = "";
  }
}

  // FORMAT DATE
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  loadReportingManager() {
  if (!this.userId) return;

  this.leaveService.getReportingManager(this.userId).subscribe({
    next: (data) => {
      console.log("Manager API response =>", data);

      this.reportingManagerName = data.managerName;
      this.reportingManagerId = data.managerId;
    },
    error: (err) => {
      console.error('Reporting manager load error', err);
    }
  });
}

viewDocument(filePath: string | undefined): void {
  if (!filePath) {
    Swal.fire('Error', 'No file path available.', 'error');
    return;
  }

  const fullPath = `${environment.apiBaseUrl}${environment.leaveDocumentPath}${filePath}`;
  window.open(fullPath, '_blank');
}



  loadLeaveTypes() {
  this.leaveService.getLeaveTypes().subscribe({
    next: (data) => {
      this.leaveTypes = data;

      // Auto set total days
      const sick = this.leaveTypes.find(x => x.leaveTypeName === 'Sick Leave');
      const casual = this.leaveTypes.find(x => x.leaveTypeName === 'Casual Leave');

      this.sickTotal = sick?.leaveDays || 0;
      this.casualTotal = casual?.leaveDays || 0;

      this.calculateLeaveSummary();
    },
    error: (err) => {
      console.error('Leave types load error', err);
    }
  });
}

loadMyLeaves() {
  this.leaveService.getMyLeaves(this.userId).subscribe({
    next: (data) => {
      this.leaveList = data.map(x => ({
        appliedDate: x.appliedDate,
        leaveType: x.leaveTypeName || '',
        fromDate: x.startDate,
        toDate: x.endDate,
        totalDays: x.totalDays,
        reason: x.reason,
        fileName: x.fileName,
        status: x.status,
        isHalfDay: x.isHalfDay ?? false
      }));

      this.calculateLeaveSummary();
    },
    error: (err) => {
      console.error("Load leaves failed", err);
    }
  });
}




  onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
    this.selectedFileName = file.name;  // 👈 only file name saved
  }
}
onHalfDayChange() {
  if (this.isHalfDay) {
    this.totalDays = 0.5;
    this.validateLeaveLimit();
    // If half day selected, force same date
    if (this.startDate) {
      this.endDate = this.startDate;
    }
  } else {
    this.calculateTotalDays();
  }
}

onLeaveTypeChange() {
  const selected = this.leaveTypes.find(x => x.leaveTypeName === this.leaveType);

  if (selected) {
    this.totalDays = selected.leaveDays;
  }
}



calculateLeaveSummary() {
  this.sickUsed = this.leaveList
    .filter(l => l.leaveType === "Sick Leave")
    .reduce((sum, l) => sum + l.totalDays, 0);

  this.casualUsed = this.leaveList
    .filter(l => l.leaveType === "Casual Leave")
    .reduce((sum, l) => sum + l.totalDays, 0);

  this.sickAvailable = this.sickTotal - this.sickUsed;
  this.casualAvailable = this.casualTotal - this.casualUsed;
}


  // START DATE CHANGE
  onStartDateChange() {
    this.calculateTotalDays();
this.validateLeaveLimit();

    this.startDateError = "";

    if (!this.startDate) return;
    if (this.isWeekend(this.startDate)) {
    this.startDateError = "Start date cannot be Saturday or Sunday.";
    this.startDate = "";
    this.totalDays = 0;
    return;
  }


    if (this.isHalfDay) {
      this.endDate = this.startDate;
      this.totalDays = 0.5;
      return;
}


    if (this.startDate < this.today) {
      this.startDateError = "Start date cannot be a past date.";
      this.totalDays = 0;
      return;
    }

    if (this.endDate && this.startDate > this.endDate) {
      this.startDateError = "Start date cannot be later than end date.";
      this.totalDays = 0;
      return;
    }

    this.calculateTotalDays();
  }

  // END DATE CHANGE
  onEndDateChange() {
    this.calculateTotalDays();
this.validateLeaveLimit();

    this.endDateError = "";

    if (this.isWeekend(this.endDate)) {
    this.endDateError = "End date cannot be Saturday or Sunday.";
    this.endDate = "";
    this.totalDays = 0;
    return;
  }

    if (this.isHalfDay) {
  this.endDate = this.startDate;
  this.totalDays = 0.5;
  return;
}


    if (!this.endDate) return;

    if (this.startDate && this.endDate < this.startDate) {
      this.endDateError = "End date cannot be earlier than start date.";
      this.totalDays = 0;
      return;
    }

    this.calculateTotalDays();
  }
  isWeekend(dateString: string): boolean {
  const date = new Date(dateString);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6;
}


  // TOTAL DAYS CALCULATION
  calculateTotalDays() {

    if (this.isHalfDay) {
    this.totalDays = 0.5;
    return;
  }

    if (!this.startDate || !this.endDate) {
      this.totalDays = 0;
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    const diff = end.getTime() - start.getTime();
    this.totalDays = diff / (1000 * 60 * 60 * 24) + 1;
  }

  // --------------------- CREATE (SUBMIT LEAVE) ---------------------
 onSubmit() {
  if (!this.leaveType || !this.startDate || !this.endDate || !this.reason) {
    alert("Please fill all required fields.");
    return;
  }
   let available = this.leaveType === "Sick Leave" ? this.sickAvailable : this.casualAvailable;

  if (this.totalDays > available) {
    Swal.fire(
      "Insufficient Balance",
      `You cannot apply for more than ${available} days.`,
      "error"
    );
    return;
  }

  

  const selected = this.leaveTypes.find(x => x.leaveTypeName === this.leaveType);
  const leaveTypeId = selected?.leaveTypeId;

  if (!leaveTypeId) {
    alert("Invalid Leave Type");
    return;
  }

  const formData = new FormData();

  formData.append("UserId", this.userId.toString());
  formData.append("CompanyId", this.companyId.toString());
  formData.append("RegionId", this.regionId.toString());
  formData.append("LeaveTypeId", leaveTypeId.toString());
  formData.append("IsHalfDay", this.isHalfDay.toString());
  formData.append("StartDate", this.startDate);
  formData.append("EndDate", this.endDate);
  formData.append("TotalDays", this.totalDays.toString());
  formData.append("Reason", this.reason);
  formData.append("ReportingManagerId", this.reportingManagerId.toString());

  if (this.selectedFile) {
    formData.append("SupportingDocument", this.selectedFile);
  }

  this.leaveService.submitLeave(formData).subscribe({
    next: (res) => {
      Swal.fire({
  icon: 'success',
  title: 'Leave Submitted!',
  text: 'Your leave request was submitted successfully.',
  timer: 1500,
  showConfirmButton: false
});


      // ✅ Reload list from DB
      this.loadMyLeaves();

      // ✅ Reset form
      this.leaveType = "";
      this.startDate = "";
      this.endDate = "";
      this.totalDays = 0;
      this.reason = "";
      this.selectedFileName = "";
      this.selectedFile = null;
      this.isHalfDay = false;
    },
    error: (err) => {
      console.error("Submit failed", err);
      Swal.fire('Error', 'Error while submitting leave.', 'error');

    }
  });
}

resetForm(): void {
  this.leaveType = "";
  this.startDate = "";
  this.endDate = "";
  this.totalDays = 0;
  this.reason = "";
  this.selectedFileName = "";
  this.selectedFile = null;
  this.isHalfDay = false;

  Swal.fire({
    icon: 'info',
    title: 'Form Reset',
    timer: 1000,
    showConfirmButton: false
  });
}

// Sorting
sortBy(column: keyof LeaveRequest): void {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }
}

// Sorted list
getSortedLeaves(): LeaveRequest[] {
  let data = [...this.leaveList];

  if (this.sortColumn) {
    data.sort((a, b) => {
      const valA = (a[this.sortColumn!] ?? '') as any;
      const valB = (b[this.sortColumn!] ?? '') as any;

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  return data;
}

// Pagination + Data
filteredLeaves(): LeaveRequest[] {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  return this.getSortedLeaves().slice(startIndex, startIndex + this.pageSize);
}

// Page Count
get totalPages(): number {
  return Math.ceil(this.leaveList.length / this.pageSize);
}

changePage(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }
}

changePageSize(size: number): void {
  this.pageSize = size;
  this.currentPage = 1;
}


}