import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { RecruitmentsService } from '../service/recruitments.service';

@Component({
  selector: 'app-interview',
  standalone: false,
  templateUrl: './interview.component.html',
  styleUrl: './interview.component.css'
})
export class InterviewComponent implements OnInit{
   userId!: number;
  companyId!: number;
  regionId!: number;
   screeningCandidates: any[] = [];   // Top table
   interviewRecords: any[] = []; 
    screeningSelectedCandidates: any[] = [];
interviewer: any[] = [];
   candidates: any[] = [];
   
  tabs = ['Resume Upload', 'Screening', 'Interview', 'Appointment', 'Offer', 'Onboarding'];
  totalStages = this.tabs.length;
     globalFilter = '';
    
  filterStage: any = '';
  isEditMode = false;
  editingCandidateId: number | null = null;
  
  departments = ['HR', 'IT', 'Finance', 'Sales'];
designations = [
    'Software Engineer',
    'Senior Developer',
    'Team Lead',
    'Manager'
  ]; 
 interviewForm: any = {  level: 1, interviewer: '', dt: '', location: '', cabin: '', result: 'Pending', feedback: '' };
  levels = [1, 2, 3, 4, 5];

constructor(private recruitmentService: RecruitmentsService) {}
 ngOnInit() {
  this.userId = Number(sessionStorage.getItem("UserId"));
  this.companyId = Number(sessionStorage.getItem("CompanyId"));
  this.regionId = Number(sessionStorage.getItem("RegionId"));

  if (!this.userId) {
    console.error("UserId missing in sessionStorage");
    return;
  }
    // ✅ ONE STATIC CANDIDATE RECORD
    
    this.loadInterviewUsers();
    this.loadInterviewRecords();
  }
  loadInterviewUsers() {
    this.recruitmentService
      .getReferenceUsers(this.companyId, this.regionId)
      .subscribe({
        next: (res) => {
          this.interviewer = res;
        },
        error: () => {
          Swal.fire('Error', 'Failed to load reference users', 'error');
        }
      });
  }
  
 updateInterview() {

    if (!this.editingCandidateId) return;

    const interviewerObj = this.interviewer.find(x => x.userId == this.interviewForm.interviewerId);

    const payload = {
      regionId: this.regionId,
      companyId: this.companyId,
      userId: this.userId,
      candidateId: this.editingCandidateId,
      levelNo: this.interviewForm.level,
      interviewerId: this.interviewForm.interviewerId,
      interviewerName: interviewerObj?.fullName,
      interviewDate: this.interviewForm.dt,
      location: this.interviewForm.location,
      meetingLink: this.interviewForm.meetingLink,
      description: this.interviewForm.feedback,
      result: this.interviewForm.result
    };

    this.recruitmentService.updateCandidateInterview(payload).subscribe(() => {
      Swal.fire('Success', 'Interview updated', 'success');
      this.loadInterviewRecords();
      this.resetForm();
    });
  }
  scheduleInterview() {
    if (this.isEditMode) {
      this.updateInterview();
      return;
    }

    if (this.screeningSelectedCandidates.length === 0) {
      Swal.fire('Warning', 'Select candidate', 'warning');
      return;
    }
    if (!this.interviewForm.level) {
      Swal.fire('Warning', 'Select Level', 'warning');
      return;
    }
    if (!this.interviewForm.interviewerId) {
      Swal.fire('Warning', 'Select Interviewer', 'warning');
      return;
    }
    if (!this.interviewForm.dt) {
      Swal.fire('Warning', 'Select Date & Time', 'warning');
      return;
    }

    const selectedCandidate = this.screeningSelectedCandidates[0];
    const selectedInterviewer = this.interviewer
      .find(x => x.userId == this.interviewForm.interviewerId);

    const payload = {
      regionId: this.regionId,
      companyId: this.companyId,
      userId: this.userId,
      candidateId: selectedCandidate.candidateId,
      levelNo: this.interviewForm.level,
      interviewerId: this.interviewForm.interviewerId,
      interviewerName: selectedInterviewer?.fullName,
      interviewDate: this.interviewForm.dt,
      location: this.interviewForm.location,
      meetingLink: this.interviewForm.meetingLink,
      description: this.interviewForm.feedback,
      result: 'Pending'
    };

    this.recruitmentService.saveCandidateInterview(payload).subscribe({
      next: () => {
        Swal.fire('Success', 'Interview scheduled successfully', 'success');

        // 🔄 Refresh bottom table
        this.loadInterviewRecords();

        // 🔄 Clear form
        this.resetForm();

        // 🔄 Remove candidate from top list (optional UX)
        this.screeningCandidates =
          this.screeningCandidates.filter(c => c !== selectedCandidate);
        this.screeningSelectedCandidates = [];
      },
      error: () => {
        Swal.fire('Error', 'Failed to schedule interview', 'error');
      }
    });
  }
loadInterviewRecords() {
    this.recruitmentService
      .getInterviewRecords(this.userId,this.companyId, this.regionId)
      .subscribe({
        next: (res) => {
          this.interviewRecords = res;
        },
        error: () => {
          Swal.fire('Error', 'Failed to load interview records', 'error');
        }
      });
  }
  resetForm() {
    this.interviewForm.level = '';
    this.interviewForm.interviewerId = '';
    this.interviewForm.dt = '';
    this.interviewForm.location = '';
    this.interviewForm.meetingLink = '';
    this.interviewForm.feedback = '';
    this.interviewForm.result = 'Pending';
  }
  isSelected(candidate: any): boolean {
  return this.screeningSelectedCandidates.includes(candidate);
}
toggleCandidate(candidate: any, event: any) {
  if (event.target.checked) {
    this.screeningSelectedCandidates.push(candidate);
  } else {
    this.screeningSelectedCandidates =
      this.screeningSelectedCandidates.filter(c => c !== candidate);
  }
}
editInterview(row: any) {
  this.isEditMode = true;
  this.editingCandidateId = row.candidateId;

  // ✅ Bind form
  this.interviewForm.level = row.levelNo;
  this.interviewForm.interviewerId = row.interviewerId;
  this.interviewForm.dt = this.toDateTimeLocal(row.interviewDate);
  this.interviewForm.location = row.location;
  this.interviewForm.meetingLink = row.meetingLink;
  this.interviewForm.feedback = row.description;
  this.interviewForm.result = row.result;

  // ✅ Set department & designation so dropdowns show correct values
  this.interviewForm.department = row.department;
  this.interviewForm.designation = row.designation;

  // ✅ Load candidate into TOP table manually
  const topCandidate = {
    candidateId: row.candidateId,
    seqNo: row.seqNo,
    name: row.candidateName,
    mobile: row.mobile,
    expectedCtc: row.expectedSalary
  };

  this.screeningCandidates = [topCandidate];
  this.screeningSelectedCandidates = [topCandidate];
}

   toDateTimeLocal(date: string) {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }

  showResume(){
if (!this.interviewForm.department || !this.interviewForm.designation) {
    Swal.fire('Warning', 'Select Department & Designation', 'warning');
    return;
  }

  this.recruitmentService
    .getScreeningCandidatesTopTableInterview(
      this.companyId,
      this.regionId,
      this.interviewForm.department,
      this.interviewForm.designation
    )
    .subscribe({
      next: (res) => {
        this.screeningCandidates = res.map(x => ({
          candidateId: x.candidateId,   // 🔥 REQUIRED
          seqNo: x.seqNo,
          name: x.name,
          mobile: x.mobile,
          expectedCtc: x.expected,
          stage: 3,
          screening: []
        }));

      },
      error: () => {
        Swal.fire('Error', 'Failed to load Candidate', 'error');
      }
    });
  }
  
 calculateProgress(c: any) {
  if (!c || !c.stageId) return 0;

  // stages: Resume(1), Screening(2), Interview(3), Appointment(4), Offer(5), Onboarding(6)
  return Math.round(((c.stageId - 1) / (this.totalStages - 1)) * 100);
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
    viewCandidates() {
    let result = [...this.candidates];
    if (this.globalFilter) {
      const f = this.globalFilter.toLowerCase();
      result = result.filter(c =>
        (c.name || '').toLowerCase().includes(f) ||
        (c.technology || '').toLowerCase().includes(f) ||
        (c.email || '').toLowerCase().includes(f)
      );
    }
    if (this.filterStage) {
      result = result.filter(c => c.stage === Number(this.filterStage));
    }
    return result;
  }
}
