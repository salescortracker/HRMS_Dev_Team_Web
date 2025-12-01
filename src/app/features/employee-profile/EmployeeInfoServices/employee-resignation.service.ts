import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeResignation } from '../Employee-Models/EmployeeResignation';

@Injectable({
  providedIn: 'root'
})
export class EmployeeResignationService {

  private apiUrl = 'https://localhost:44370/api/EmployeeFullInfo';

  constructor(private http: HttpClient) { }

  // GET all resignations
  getAll(companyId: number, regionId: number, roleId: Number): Observable<EmployeeResignation[]> {
    return this.http.get<EmployeeResignation[]>(
      `${this.apiUrl}/GetResignations?companyId=${companyId}&regionId=${regionId}&roleId=${roleId}`
    );
  }

  // GET resignation by ID
  getById(id: number): Observable<EmployeeResignation> {
    return this.http.get<EmployeeResignation>(
      `${this.apiUrl}/GetResignationById?id=${id}`
    );
  }

  // CREATE resignation
  create(model: EmployeeResignation): Observable<any> {
    return this.http.post(`${this.apiUrl}/SaveResignation`, model);
  }

  // UPDATE resignation
  update(id: number, model: EmployeeResignation): Observable<any> {
    return this.http.post(`${this.apiUrl}/UpdateResignation/${id}`, model);
  }

  delete(id: number): Observable<any> {
    const companyId = sessionStorage.getItem("CompanyId");
    const regionId = sessionStorage.getItem("RegionId");
    const roleId = sessionStorage.getItem("roleId");

    return this.http.delete(
      `${this.apiUrl}/DeleteResignation/${id}?companyId=${companyId}&regionId=${regionId}&roleId=${roleId}`
    );
  }
}
