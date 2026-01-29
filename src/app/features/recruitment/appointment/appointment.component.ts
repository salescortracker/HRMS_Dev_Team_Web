import { Component } from '@angular/core';
import { RecruitmentsService } from '../service/recruitments.service';

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
    this.service.getAppointments(this.companyId, this.regionId, this.userId)
      .subscribe(res => {
        this.appointments = res;
      });
  }
  onEdit(row: any) {
    this.service.getAppointmentCandidateDetails(row.candidateId)
      .subscribe(res => {
        this.selectedCandidate = {
          ...res,
          description: '',
          reportedBy: null
        };
      });
  }

  loadReporters() {
    this.service.getReferenceUsers(this.companyId, this.regionId)
      .subscribe(res => this.reporters = res);
  }

  save() {
    console.log("Save payload:", this.selectedCandidate);
  }
}
