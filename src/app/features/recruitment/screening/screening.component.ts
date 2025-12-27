import { Component, OnInit } from '@angular/core';
import { RecruitmentsService } from '../service/recruitments.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-screening',
  standalone: false,
  templateUrl: './screening.component.html',
  styleUrl: './screening.component.css'
})
export class ScreeningComponent implements OnInit {
   tabs = ['Resume Upload', 'Screening', 'Interview', 'Offer', 'Onboarding'];
  totalStages = this.tabs.length;
  activeTab = 1;
  // ---------- Sorting ----------
sortColumn: string | null = null;
sortDirection: 'asc' | 'desc' = 'asc';

// ---------- Pagination ----------
pageSize = 5;
currentPage = 1;
pageSizeOptions = [5, 10, 20, 50];


  userId!: number;
  companyId!: number;
  regionId!: number;

  roleId!: number;
  recruiters: any[] = [];
  candidates: any[] = [];

  screeningSelectedCandidates: any[] = [];
  screeningRecruiters: any[] = [];
 
 screeningRecords: any[] = [];
  screeningResult = 'Pass';
  screeningRemarks = '';

   constructor(private service: RecruitmentsService) {}

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem('UserId'));
    this.companyId = Number(sessionStorage.getItem('CompanyId'));
    this.regionId = Number(sessionStorage.getItem('RegionId'));
    this.roleId = Number(sessionStorage.getItem('roleId'));

    if (!this.userId) {
      console.error('UserId missing');
      return;
    }

    this.loadCandidates();
    this.loadRecruiters(); // replace later with backend candidates
     this.loadScreeningRecords();
  }
 loadCandidates() {
  this.service
    .getScreeningCandidates(this.userId, this.roleId)
    .subscribe(res => this.candidates = res);
}


  // ================= Load Recruiters =================
 loadRecruiters() {
    this.service.getRecruiterNames()
      .subscribe(res => this.recruiters = res);
  }

  // ================= Apply Screening =================
applyScreening(form: any) {
   if (form.invalid) {
    Swal.fire('Validation Error', 'Please fill all required fields.', 'warning');
    return;
  }

  if (!this.screeningSelectedCandidates.length) {
    Swal.fire('Validation Error', 'Please select at least one candidate', 'warning');
    return;
  }

  if (!this.screeningRecruiters.length) {
    Swal.fire('Validation Error', 'Please select at least one recruiter', 'warning');
    return;
  }

  const payload = {
    regionId: this.regionId,
    companyId: this.companyId,
    userId: this.userId,
    candidateIds: this.screeningSelectedCandidates.map(c => c.candidateId),
    recruiterIds: this.screeningRecruiters.map(r => r.userId),
    result: this.screeningResult,
    remarks: this.screeningRemarks
  };

  Swal.fire({
    title: 'Apply Screening?',
    text: 'Do you want to save this screening result?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Save',
    cancelButtonText: 'Cancel'
  }).then(result => {
    if (result.isConfirmed) {
      this.service.saveScreening(payload).subscribe({
        next: () => {
          Swal.fire('Success', 'Screening saved successfully', 'success');
          this.loadCandidates();
          this.loadScreeningRecords();

          this.screeningSelectedCandidates = [];
          this.screeningRecruiters = [];
          this.screeningRemarks = '';
          this.screeningResult = 'Pass';
        },
        error: () => {
          Swal.fire('Error', 'Failed to save screening', 'error');
        }
      });
    }
  });
}
sortBy(column: string) {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }
}

getSortedRecords() {
  let data = [...this.screeningRecords];

  if (this.sortColumn) {
    data.sort((a, b) => {
      const valA = a[this.sortColumn!] ?? '';
      const valB = b[this.sortColumn!] ?? '';

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  return data;
}
pagedScreeningRecords() {
  const sorted = this.getSortedRecords();
  const start = (this.currentPage - 1) * this.pageSize;
  return sorted.slice(start, start + this.pageSize);
}

get totalPages() {
  return Math.ceil(this.screeningRecords.length / this.pageSize);
}

changePage(page: number) {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }
}

changePageSize(size: number) {
  this.pageSize = size;
  this.currentPage = 1;
}


loadScreeningRecords() {
  this.service
    .getScreeningRecords(this.companyId, this.regionId)
    .subscribe(res => this.screeningRecords = res);
}

  // ================= Helpers =================
  calculateProgress(c: any) {
    return Math.round(((c.stage - 1) / (this.totalStages - 1)) * 100);
  }

  getProgressColor(c: any) {
    const pct = this.calculateProgress(c);
    if (pct >= 80) return 'bg-success';
    if (pct >= 40) return 'bg-warning';
    return 'bg-danger';
  }

  todayTime() {
    const d = new Date();
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }

  // ================= Dummy Data =================
  loadDummyData() {
    this.candidates = [
      {
        id: 1,
        name: 'Anita Sharma',
        technology: 'Angular',
        stage: 1,
        screening: []
      }
    ];
  }

  viewCandidates() {
    return this.candidates;
  }
}