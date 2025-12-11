import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class LeaveService {

  private baseUrl = 'https://localhost:44370/api'; // 🔹 Change this to your actual API URL
  
    constructor(private http: HttpClient) {}

  getLeaveTypes(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/Leave/GetActiveLeaveTypes`);
}


getReportingManager(userId: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/Leave/GetReportingManager/${userId}`);
}
submitLeave(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/Leave/SubmitLeave`, formData);
  }

  // ✅ Get My Leave List
  getMyLeaves(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Leave/GetMyLeaves/${userId}`);
  }

  getLeavesForManager(managerId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/Leave/GetLeavesForManager/${managerId}`);
}

approveLeave(leaveId: number) {
  return this.http.post(`${this.baseUrl}/Leave/ApproveByManager/${leaveId}`, {});
}

rejectLeave(leaveId: number) {
  return this.http.post(`${this.baseUrl}/Leave/RejectByManager/${leaveId}`, {});
}

bulkApprove(ids: number[]) {
  return this.http.post(`${this.baseUrl}/Leave/BulkApprove`, ids);
}

bulkReject(ids: number[]) {
  return this.http.post(`${this.baseUrl}/Leave/BulkReject`, ids);
}

// get user leaves (employee view)
getUserLeaves(userId: number) {
  return this.http.get<any[]>(`${this.baseUrl}/Leave/GetUserLeaves/${userId}`);
}

// get manager leaves (leaves of employees assigned to manager)
getManagerLeaves(managerId: number) {
  return this.http.get<any[]>(`${this.baseUrl}/Leave/GetManagerLeaves/${managerId}`);
}

 
}
