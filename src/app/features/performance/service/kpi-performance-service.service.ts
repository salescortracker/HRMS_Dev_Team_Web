import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
export interface EmployeeKpiItem {
  KpiObjective: string;
  Weightage: number;
  Target: string;
  TaskCompleted: string;
  SelfRating: number;
  Remarks: string;
}

export interface EmployeeKpi {
  KpiId?: number;
  UserId: number;
  CompanyId: number;
  RegionId: number;
  EmployeeNameId: string;
  ReportingManagerId: string;
  Designation: string;
  DepartmentId: string;
  DateOfJoining: string;
  ProbationStatus: string;
  PerformanceCycle: string;
  ApplicableStartDate: string;
  ApplicableEndDate: string;
  ProgressType: string;
  AppraisalYear: number;
  SelfReviewSummary: string;
  KpiItems: EmployeeKpiItem[];
}
export interface ManagerKpiReview {
  reviewId: number;
  kpiItemId: number;
  employeeName: string;
  employeeId: string;
  appraisalYear: number;
  kpiObjective: string;
  weightage: number;
  target: string;
  taskCompleted: string;
  selfRating: number;
  managerRating: number;
  avgRating: number;
  managerComments: string;
  status: string;
  employeeEmail: string;
  isSelected?: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class KpiPerformanceServiceService {
    private baseUrl = 'https://localhost:44370/api/EmployeeKpi';

  constructor(private http: HttpClient) {}

 createKpi(kpi: EmployeeKpi, file?: File): Observable<any> {
  const formData = new FormData();

  Object.entries(kpi).forEach(([key, value]) => {
    if (key !== 'KpiItems' && value !== null && value !== undefined) {
      formData.append(key, value.toString());
    }
  });

  // File field name MUST MATCH DTO
  if (file) {
   formData.append("DocumentEvidence", file, file.name);

  }

  // Append KPI items correctly
  kpi.KpiItems.forEach((item, index) => {
    formData.append(`KpiItems[${index}].KpiObjective`, item.KpiObjective);
    formData.append(`KpiItems[${index}].Weightage`, item.Weightage.toString());
    formData.append(`KpiItems[${index}].Target`, item.Target);
    formData.append(`KpiItems[${index}].TaskCompleted`, item.TaskCompleted);
    formData.append(`KpiItems[${index}].SelfRating`, item.SelfRating.toString());
    formData.append(`KpiItems[${index}].Remarks`, item.Remarks);
  });

  return this.http.post(`${this.baseUrl}/CreateKpi`, formData);
}


  updateReview(body: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/UpdateReview`, body);
  }


  getReviews(managerId: number): Observable<ManagerKpiReview[]> {
    return this.http.get<ManagerKpiReview[]>(`${this.baseUrl}/Manager/GetReviews/${managerId}`);
  }

  updateStatus(body: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/Manager/UpdateStatus`, body);
  }


}
