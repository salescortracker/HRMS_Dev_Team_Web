import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecruitmentsService {

   private baseUrl = 'https://localhost:44370/api'; // 🔹 Change this to your actual API URL
  
    constructor(private http: HttpClient) {} 


      getRecruiterNames(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/Recruitmen/GetRecruiters`);
}

    // -------- Add Candidate (Resume Upload) --------
  addCandidate(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/Recruitmen/AddCandidate`, formData);
  }

  // -------- Get Candidates Listing --------
  getCandidates(userId: number, roleId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/Recruitmen/GetCandidates/${userId}/${roleId}`
    );
  }

  
  deleteCandidate(candidateId: number, userId: number): Observable<any> {
  return this.http.delete(
    `${this.baseUrl}/Recruitmen/DeleteCandidate/${candidateId}/${userId}`
  );
}
 advanceStage(candidateId: number, userId: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/Recruitmen/AdvanceStage/${candidateId}/${userId}`,
      {}
    );
  }
 applyScreening(payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/Recruitmen/ApplyScreening`,
      payload
    );
  }
  saveScreening(payload: any) {
  return this.http.post(`${this.baseUrl}/Recruitmen/SaveScreening`, payload);
}

getScreeningCandidates(userId: number, roleId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitmen/GetScreeningCandidates/${userId}/${roleId}`
  );
}

 getScreeningRecords(companyId: number, regionId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitmen/GetScreeningRecords/${companyId}/${regionId}`
  );
}

}
