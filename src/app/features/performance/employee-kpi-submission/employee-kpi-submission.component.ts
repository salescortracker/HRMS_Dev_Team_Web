import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KpiPerformanceServiceService } from '../service/kpi-performance-service.service';

@Component({
  selector: 'app-employee-kpi-submission',
  standalone: false,
  templateUrl: './employee-kpi-submission.component.html',
  styleUrl: './employee-kpi-submission.component.css'
})
export class EmployeeKpiSubmissionComponent implements OnInit {

  kpiForm!: FormGroup;
  selectedFile?: File;

  userId!: number;
  companyId!: number;
  regionId!: number;

  constructor(
    private fb: FormBuilder,
    private kpiService: KpiPerformanceServiceService
  ) {}

  ngOnInit(): void {

   this.userId = Number(sessionStorage.getItem('UserId'));
this.companyId = Number(sessionStorage.getItem('CompanyId'));
this.regionId = Number(sessionStorage.getItem('RegionId'));


    this.kpiForm = this.fb.group({
      UserId: [this.userId, Validators.required],
      CompanyId: [this.companyId, Validators.required],
      RegionId: [this.regionId, Validators.required],
      EmployeeNameId: ['', Validators.required],
      ReportingManagerId: ['', Validators.required],
      Designation: ['', Validators.required],
      DepartmentId: ['', Validators.required],
      DateOfJoining: ['', Validators.required],
      ProbationStatus: ['', Validators.required],
      PerformanceCycle: ['', Validators.required],
      ApplicableStartDate: ['', Validators.required],
      ApplicableEndDate: ['', Validators.required],
      ProgressType: ['', Validators.required],
      AppraisalYear: ['', Validators.required],
      SelfReviewSummary: [''],

      KpiItems: this.fb.array([])
    });

    this.addKpiItem();
  }

  get kpiItems(): FormArray {
    return this.kpiForm.get('KpiItems') as FormArray;
  }

  addKpiItem() {
    this.kpiItems.push(
      this.fb.group({
        KpiObjective: [''],
        Weightage: [0],
        Target: [''],
        TaskCompleted: [''],
        SelfRating: [0],
        Remarks: ['']
      })
    );
  }

  removeKpiItem(index: number) {
    this.kpiItems.removeAt(index);
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }
  formatDate(date: any): string {
  return new Date(date).toISOString().split("T")[0];
}


 submitKpi() {
  if (this.kpiForm.invalid) {
    alert('Fill all required fields.');
    return;
  }

  const formValue = this.kpiForm.value;

 formValue.DateOfJoining = this.formatDate(formValue.DateOfJoining);
formValue.ApplicableStartDate = this.formatDate(formValue.ApplicableStartDate);
formValue.ApplicableEndDate = this.formatDate(formValue.ApplicableEndDate);
  this.kpiService.createKpi(formValue, this.selectedFile)
    .subscribe({
      next: () => {
        alert('KPI created successfully!');
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Error creating KPI');
      }
    });
}

}
