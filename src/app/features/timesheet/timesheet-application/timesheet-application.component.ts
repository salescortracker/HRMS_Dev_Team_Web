import { Component, OnInit } from '@angular/core';
import { TimesheetModel } from '../../../admin/layout/models/timesheetmodule.model';
import { TimesheetService } from '../service/timesheet.service';

@Component({
  selector: 'app-timesheet-application',
  standalone: false,
  templateUrl: './timesheet-application.component.html',
  styleUrl: './timesheet-application.component.css'
})
export class TimesheetApplicationComponent implements OnInit {
    model: TimesheetModel = {
    employeeName: '',
    employeeCode: '',
    date: '',
    comments: '',
    attachment: null,
    projects: [],
    status: 'Pending'
  };

   userId!: number;
  companyId!: number;
  regionId!: number;

  submittedTimesheets: TimesheetModel[] = [];

    constructor(private timesheetService: TimesheetService) {}
    ngOnInit(): void {
   this.userId = Number(sessionStorage.getItem("UserId"));
  this.companyId = Number(sessionStorage.getItem("CompanyId"));
  this.regionId = Number(sessionStorage.getItem("RegionId"));

  if (!this.userId) {
    console.error("UserId missing in sessionStorage");
    return;
  }

  this.loadMyTimesheets();
  this.timesheetService.getLoggedInUser(this.userId)
      .subscribe({
        next: (res) => {
          this.model.employeeName = res.employeeName;
          this.model.employeeCode = res.employeeCode;
        },
        error: (err) => {
          console.error('Failed to load logged-in user', err);
        }
      });

}
private timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

private minutesToHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}


  // ADD PROJECT (same as addLevel)
  addProject() {
    this.model.projects.push({
      projectName: '',
      startTime: '',
      endTime: '',
      totalHours: '00:00',
      overtimeHours: ''
    });
  }
  
   


  // REMOVE PROJECT
  removeProject(index: number) {
    this.model.projects.splice(index, 1);
  }

  // CALCULATE HOURS PER PROJECT
  calculateProjectHours(project: any) {
  if (project.startTime && project.endTime) {

    const [sh, sm] = project.startTime.split(':').map(Number);
    const [eh, em] = project.endTime.split(':').map(Number);

    let startMinutes = sh * 60 + sm;
    let endMinutes = eh * 60 + em;

    // Handle night shift (end next day)
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    const diffMinutes = endMinutes - startMinutes;

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    // Display as HH:mm
    project.totalHours =
  `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

project.totalHoursText =
  `${hours} Hour${hours !== 1 ? 's' : ''} ${minutes} Minute${minutes !== 1 ? 's' : ''}`;

  }
}


 saveTimesheet(form: any) {
  if (!form.valid || this.model.projects.length === 0) {
    alert('Please complete the form');
    return;
  }

  const formData = new FormData();

  formData.append('UserId', this.userId.toString());
  formData.append('CompanyId', this.companyId.toString());
  formData.append('RegionId', this.regionId.toString());
  formData.append('EmployeeCode', this.model.employeeCode);
  formData.append('EmployeeName', this.model.employeeName);
  formData.append('TimesheetDate', this.model.date);
  formData.append('Comments', this.model.comments ?? '');
  formData.append('Status', 'Pending');

  if (this.model.attachment) {
    formData.append('Attachment', this.model.attachment);
  }

  this.model.projects.forEach((p, index) => {
    const totalMinutes = this.timeToMinutes(p.totalHours);
    const otMinutes = p.overtimeHours
      ? this.timeToMinutes(p.overtimeHours)
      : 0;

    formData.append(`Projects[${index}].ProjectName`, p.projectName);
    formData.append(`Projects[${index}].StartTime`, p.startTime);
    formData.append(`Projects[${index}].EndTime`, p.endTime);
    formData.append(`Projects[${index}].TotalMinutes`, totalMinutes.toString());
    formData.append(`Projects[${index}].TotalHoursText`, p.totalHoursText ?? '');
    formData.append(`Projects[${index}].OTMinutes`, otMinutes.toString());
    formData.append(`Projects[${index}].OTHoursText`, p.overtimeHours ?? '');
  });

  this.timesheetService.submittimesheet(formData).subscribe({
    next: () => {
      alert('Timesheet saved');

      this.loadMyTimesheets(); // ✅ listing updates HERE

      form.resetForm();
      this.model.projects = [];
      this.model.employeeName = this.model.employeeName;
      this.model.employeeCode = this.model.employeeCode;
    },
    error: () => alert('Save failed')
  });
}

sendTimesheet() {
  alert('Timesheet sent to manager for approval');
  // Later: call API to update status + send email
}

loadMyTimesheets() {
  this.timesheetService.gettimesheetlisting(this.userId).subscribe({
    next: (res) => {
      this.submittedTimesheets = res.map((x: any) => ({
        employeeName: x.employeeName,
        employeeCode: x.employeeCode,

        date: x.timesheetDate ? x.timesheetDate.split('T')[0] : '',
        status: x.status,
        comments: '',
        attachment: null,

        // 🔥 MAP PROJECTS CORRECTLY
        projects: (x.projects || []).map((p: any) => ({
          projectName: p.projectName,

          // backend → UI mapping
          totalHours: p.totalHoursText ?? '00:00',
          overtimeHours: p.otHoursText ?? '00:00'
        }))
      }));
    },
    error: (err) => {
      console.error('Failed to load timesheets', err);
    }
  });
}

  onFileSelect(event: any) {
    this.model.attachment = event.target.files[0];
  }
}