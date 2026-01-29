import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
 private baseUrl = 'https://localhost:44370/api'; // 🔹 Change this to your actual API URL

    constructor(private http: HttpClient) {}

getLoggedInUser(userId: number): Observable<any> {
  return this.http.get<any>(
    `${this.baseUrl}/Timesheet/GetLoggedInUser/${userId}`
  );
}
gettimesheetlisting(userId: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/Timesheet/GetMyTimesheets/${userId}`);
}
submittimesheet(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/Timesheet/SaveTimesheet`, formData);
  }
  sendSelectedTimesheets(ids: number[]) {
  return this.http.post(`${this.baseUrl}/Timesheet/SendSelectedTimesheets`, ids);
}
// ✅ MANAGER LIST
  getManagerTimesheets(managerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/Timesheet/GetManagerTimesheets/${managerId}`);
  }

  // ✅ VIEW FULL TIMESHEET DETAILS
  getTimesheetDetail(timesheetId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/Timesheet/GetTimesheetDetail/${timesheetId}`);
  }

  // ✅ APPROVE / REJECT
  approveTimesheets(ids: number[], comments: string) {
    return this.http.post(`${this.baseUrl}/Timesheet/ApproveTimesheets`, { ids, comments });
  }

  rejectTimesheets(ids: number[], comments: string) {
    return this.http.post(`${this.baseUrl}/Timesheet/RejectTimesheets`, { ids, comments });
  }

}
