import { Component } from '@angular/core';
import { RecruitmentsService } from '../service/recruitments.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-appointment',
  standalone: false,
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css'
})
export class AppointmentComponent {
    appointments: any[] = [];
  selectedCandidate: any = null;
  reporters: any[] = [];
   userId!: number;
  companyId!: number;
  regionId!: number;
  constructor(private service: RecruitmentsService) {}
ngOnInit() {
  this.userId = Number(sessionStorage.getItem("UserId"));
  this.companyId = Number(sessionStorage.getItem("CompanyId"));
  this.regionId = Number(sessionStorage.getItem("RegionId"));

  if (!this.userId) {
    console.error("UserId missing in sessionStorage");
    return;
  }
  this.loadAppointments();
  this.loadReporters();
}
loadAppointments() {
    this.service.getAppointments(this.userId)
      .subscribe(res => {
        this.appointments = res;
      });
  }
 onEdit(row: any) {
  this.service.getAppointmentCandidateDetails(row.candidateId)
    .subscribe(res => {
      this.selectedCandidate = {
        ...res,
        result: row.result || 'Selected',
        description: row.description || '',
        reportedBy: this.userId,
        interviewId: row.interviewId,
        interviewDate: row.interviewDate,
        location: row.location,
        levelNo: row.levelNo   // ✅ IMPORTANT
      };
    });
}


  loadReporters() {
  this.reporters = [{
    userId: this.userId,
    fullName: sessionStorage.getItem("Name")
  }];
}


save() {
  if (!this.selectedCandidate) return;

  const payload = {
    interviewId: this.selectedCandidate.interviewId,
    regionId: this.regionId,
    companyId: this.companyId,
    userId: this.userId,
    candidateId: this.selectedCandidate.candidateId,

    levelNo: this.selectedCandidate.levelNo,   // ✅ dynamic
    interviewerId: this.userId,
    interviewerName: sessionStorage.getItem("Name"),
    interviewDate: this.selectedCandidate.interviewDate,
    location: this.selectedCandidate.location,
    meetingLink: null,

    description: this.selectedCandidate.description,
    result: this.selectedCandidate.result
  };

  this.service.updateCandidateInterview(payload).subscribe({
    next: () => {
      Swal.fire("Success", "Appointment updated successfully", "success");
      this.loadAppointments();     // ✅ refresh top table
      this.selectedCandidate = null;
    },
    error: () => {
      Swal.fire("Error", "Unable to save appointment", "error");
    }
  });
}


}