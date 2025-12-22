import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private baseUrl = 'https://localhost:44370/api/Event';

  constructor(private http: HttpClient) {}

  getEventTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/EventTypes`);
  }

  getEvents(
    companyId: string,
    regionId: string,
    userId: string,
    roleId: string='0'
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}?companyId=${companyId}&regionId=${regionId}&userId=${userId}&roleId=${roleId}`
    );
  }

  getEventById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  createEvent(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  updateEvent(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data);
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
