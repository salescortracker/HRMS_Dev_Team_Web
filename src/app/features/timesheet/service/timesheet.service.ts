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

}
