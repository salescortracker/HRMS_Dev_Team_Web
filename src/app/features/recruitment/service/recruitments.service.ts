import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecruitmentsService {

 private baseUrl = 'https://localhost:44370/api'; // same pattern as LeaveService

  constructor(private http: HttpClient) {}

///////////////////////////////////////////////////////
//////////////Resuem Upload - Recruitment /////////////
///////////////////////////////////////////////////////
  getReferenceUsers(companyId: number, regionId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetReferenceUsers/${companyId}/${regionId}`
  );
}
  // 🔹 Stage Master
  getStages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Recruitment/GetStages`);
  }

  // 🔹 Save Candidate (Resume Upload)
  saveCandidate(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/Recruitment/SaveCandidate`, formData);
  }

  // 🔹 Get Candidates Listing
  getCandidates(userId: number,companyId: number, regionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Recruitment/GetCandidates/${userId}/${companyId}/${regionId}`);
  }

  // 🔹 Move Stage
  moveStage(candidateId: number, stageId: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/Recruitment/MoveStage?candidateId=${candidateId}&stageId=${stageId}`,
      {}
    );
  }
 deleteCandidate(candidateId: number) {
  return this.http.delete(
    `${this.baseUrl}/Recruitment/DeleteCandidate/${candidateId}`
  );
}
getCandidateById(candidateId: number) {
  return this.http.get<any>(
    `${this.baseUrl}/Recruitment/GetCandidateById/${candidateId}`
  );
}
updateCandidate(formData: FormData) {
  return this.http.put(
    `${this.baseUrl}/Recruitment/UpdateCandidate`,
    formData
  );
}

///////screening Service ///////////



getRecruiterseUsers(companyId: number, regionId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetRecruiters/${companyId}/${regionId}`
  );
}
getScreeningCandidatesTopTable(
  companyId: number,
  regionId: number,
  department: string,
  designation: string
) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetScreeningCandidatesTopTable`,
    {
      params: {
        companyId,
        regionId,
        department,
        designation
      }
    }
  );
}

// 🔹 Save Screening Result
saveCandidateScreening(payload: any): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/Recruitment/SaveCandidateScreening`,
    payload
  );
}
getScreeningRecords(userId: number,companyId: number, regionId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetScreeningRecords/${userId}/${companyId}/${regionId}`
  );
}
updateCandidateScreening(payload: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/Recruitment/UpdateScreening`, payload);
}


//////////////Interview Service /////////////
getScreeningCandidatesTopTableInterview(
  companyId: number,
  regionId: number,
  department: string,
  designation: string
) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetScreeningCandidatesTopTableInterview`,
    {
      params: {
        companyId,
        regionId,
        department,
        designation
      }
    }
  );
}
saveCandidateInterview(payload: any): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/Recruitment/SaveCandidateInterview`,
    payload
  );
}

getInterviewRecords(userId: number,companyId: number, regionId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetInterviewRecords/${userId}/${companyId}/${regionId}`
  );
}
updateCandidateInterview(payload: any) {
  return this.http.put(
    `${this.baseUrl}/Recruitment/UpdateCandidateInterview`,
    payload
  );
}


// 🔹 Appointment Screen
getAppointments(companyId: number, regionId: number, interviewerId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Recruitment/GetAppointments/${companyId}/${regionId}/${interviewerId}`
  );
}
getAppointmentCandidateDetails(candidateId: number) {
  return this.http.get<any>(
    `${this.baseUrl}/Recruitment/GetAppointmentCandidateDetails/${candidateId}`
  );
}

}
