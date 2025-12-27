import { Component } from '@angular/core';
import { RecruitmentsService } from '../service/recruitments.service';
import Swal from 'sweetalert2';
import { environment } from '../environment/environment';

@Component({
  selector: 'app-resumeupload',
  standalone: false,
  templateUrl: './resumeupload.component.html',
  styleUrl: './resumeupload.component.css'
})
export class ResumeuploadComponent {
   constructor(private recruitmentService: RecruitmentsService) {}
tabs = ['Resume Upload', 'Screening', 'Interview', 'Offer', 'Onboarding'];
// -------- Sorting --------
sortColumn: string | null = null;
sortDirection: 'asc' | 'desc' = 'asc';

// -------- Pagination --------
pageSize = 5;
currentPage = 1;
pageSizeOptions = [5, 10, 20, 50];


  candidates: any[] = [];
  selectedCandidate: any = null;

  userId!: number;
  companyId!: number;
  regionId!: number;
  roleId!: number;

  candidateForm: any = {
    name: '',
    email: '',
    mobile: '',
    technology: '',
    experience: 0,
    currentCTC: '',
    appliedDate: '',
    resumeFiles: null
  };

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem('UserId'));
    this.companyId = Number(sessionStorage.getItem('CompanyId'));
    this.regionId = Number(sessionStorage.getItem('RegionId'));
    this.roleId = Number(sessionStorage.getItem('roleId'));

    this.loadCandidates();
    this.candidateForm.appliedDate = new Date().toISOString().split('T')[0];
  }

  // -------- Resume Upload --------
  onResumeFiles(evt: any) {
    this.candidateForm.resumeFiles = evt.target.files;
  }

 addCandidate(form: any) {

  // ❌ Block if any required field is missing
  if (form.invalid) {
    Swal.fire('Validation Error', 'Please fill all required fields correctly.', 'warning');
    return;
  }

  // ❌ Email Unique Validation
  const exists = this.candidates.some(
    x => x.email.toLowerCase() === this.candidateForm.email.toLowerCase()
  );
  if (exists) {
    Swal.fire('Duplicate Email', 'This email already exists. Provide unique email.', 'error');
    return;
  }

  // ❌ Resume Validation (file type + size)
  const file = this.candidateForm.resumeFiles?.[0];
  if (!file) {
    Swal.fire('Error', 'Resume is required.', 'error');
    return;
  }

  const allowedFormats = ['pdf', 'doc', 'docx'];
  const ext = file.name.split('.').pop().toLowerCase();
  if (!allowedFormats.includes(ext)) {
    Swal.fire('Invalid File', 'Only PDF, DOC, DOCX allowed.', 'error');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    Swal.fire('File Too Large', 'Maximum size allowed is 10 MB.', 'error');
    return;
  }

  // --- Build FormData & Submit ----
  const formData = new FormData();
formData.append('CandidateName', this.candidateForm.name);
formData.append('Email', this.candidateForm.email);
formData.append('Mobile', this.candidateForm.mobile);
formData.append('Technology', this.candidateForm.technology);
formData.append('ExperienceYears', this.candidateForm.experience.toString());

formData.append('CurrentCTC', this.candidateForm.currentCTC ?? '');
formData.append('AppliedDate', this.candidateForm.appliedDate);

// 🔐 System parameters
formData.append('UserId', this.userId.toString());
formData.append('CompanyId', this.companyId.toString());
formData.append('RegionId', this.regionId.toString());

// 📄 File
formData.append('ResumeFile', file);

  this.recruitmentService.addCandidate(formData).subscribe({
    next: () => {
      Swal.fire('Success', 'Candidate added successfully!', 'success');
      this.resetForm();
      this.loadCandidates();
    },
    error: (err) =>
      Swal.fire('Error', err.error?.message || 'Failed to add candidate', 'error')
  });
}
sortBy(column: string): void {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }
}

getSortedCandidates(): any[] {
  let data = [...this.candidates];

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
pagedCandidates(): any[] {
  const sorted = this.getSortedCandidates();
  const startIndex = (this.currentPage - 1) * this.pageSize;
  return sorted.slice(startIndex, startIndex + this.pageSize);
}

get totalPages(): number {
  return Math.ceil(this.candidates.length / this.pageSize);
}

changePageSize(size: number): void {
  this.pageSize = size;
  this.currentPage = 1;
}

changePage(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }
}

  resetForm() {
    this.candidateForm = {
      name: '',
      email: '',
      mobile: '',
      technology: '',
      experience: 0,
      currentCTC: '',
      appliedDate: '',
      resumeFiles: null
    };
  }

  // -------- Listing --------
  loadCandidates() {
    this.recruitmentService
      .getCandidates(this.userId, this.roleId)
      .subscribe(res => {
        this.candidates = res;
        this.currentPage = 1;
        this.selectedCandidate = res.length ? res[0] : null;
      });
  }

  // -------- Advance Stage --------
 // -------- Advance Stage with Confirmation --------
advanceStage(c: any) {
  Swal.fire({
    title: "Move to Next Stage?",
    text: `Are you sure you want to move "${c.candidateName}" to next stage?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#28a745",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Advance"
  }).then((result) => {
    if (result.isConfirmed) {
      this.recruitmentService.advanceStage(c.candidateId, this.userId).subscribe({
        next: () => {
          Swal.fire("Stage Updated!", "Candidate has been moved to next stage.", "success");
          this.loadCandidates();
        },
        error: (err) => {
          Swal.fire("Error", err.error?.message || "Failed to update stage!", "error");
        }
      });
    }
  });
}


  // -------- UI Helpers --------
  calculateProgress(c: any) {
    return c.progressPercent ?? 0;
  }

  getProgressColor(c: any) {
    const pct = c.progressPercent;
    if (pct >= 80) return 'bg-success';
    if (pct >= 40) return 'bg-warning';
    return 'bg-danger';
  }
 // ---------- Template helper methods (REQUIRED by HTML) ----------

viewCandidates() {
  return this.candidates || [];
}

selectCandidate(c: any) {
  this.selectedCandidate = c;
}

// -------- Delete Candidate with Confirmation --------
removeCandidate(c: any) {
  Swal.fire({
    title: "Delete Candidate?",
    text: `This will permanently remove "${c.candidateName}".`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, Delete"
  }).then((result) => {
    if (result.isConfirmed) {
      this.recruitmentService.deleteCandidate(c.candidateId, this.userId).subscribe({
        next: () => {
          Swal.fire("Deleted!", "Candidate has been removed.", "success");
          this.loadCandidates();
        },
        error: (err) => {
          Swal.fire("Error", err.error?.message || "Failed to delete record!", "error");
        }
      });
    }
  });
}


viewDocument(fileName: string | undefined): void {
  if (!fileName) {
    Swal.fire('Error', 'No file available.', 'error');
    return;
  }

  const fileUrl = `${environment.apiBaseUrl}${environment.resumePath}${fileName}`;

  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;   // ✅ forces download
  link.target = '_blank'; // ✅ open in new tab

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

}