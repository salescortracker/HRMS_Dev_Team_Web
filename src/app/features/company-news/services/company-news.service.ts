import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CompanyNewsDto {
  title: string;
  category: string;
  description: string;
  displayDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyNewsService {

   private baseUrl = 'https://localhost:44370/api'; // 🔹 Change this to your actual API URL

  constructor(private http: HttpClient) {}

 getCompanyNewsByCategory(category: string): Observable<CompanyNewsDto[]> {
    const params = new HttpParams().set('category', category);

    return this.http.get<CompanyNewsDto[]>(
      `${this.baseUrl}/MasterData/GetCompanyNewsForSuperAdmin`,
      { params }
    );
  }
}
