import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './environment/environment';

export interface AssetDto {
  assetID?: number;
  companyID: number;
  regionID: number;
  userID: number;
  assetName: string;
  assetCode: string;
  assetLocation?: string;
  assetCost: number;
  currencyCode: string;
  assetDescription?: string;
  assetModel?: string;
  purchaseOrder?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  assetReturnDate?: string;
  assetStatusID: number;
  createdBy?: number;
  modifiedBy?: number;
 employeeName?: string; // ✅ NEW
}
export interface EmployeeDto {
  userId: number;
  fullName: string;
}

export interface AssetStatus {
  assetStatusId: number;
  assetStatusName: string;
}
@Injectable({
  providedIn: 'root'
})
export class AssetService {

    private apiUrl = `${environment.apiUrl}/Asset`;
  constructor(private http: HttpClient) {}

    getAllAssets$(): Observable<AssetDto[]> {
    return this.http.get<AssetDto[]>(this.apiUrl);
  }

  // GET assets by user
  getAssetsByUserId$(userId: number): Observable<AssetDto[]> {
    return this.http.get<AssetDto[]>(`${this.apiUrl}/user/${userId}`);
  }

  // CREATE asset
  createAsset$(payload: AssetDto): Observable<number> {
    return this.http.post<number>(this.apiUrl, payload);
  }

  // UPDATE asset
  updateAsset$(payload: AssetDto): Observable<void> {
    return this.http.put<void>(this.apiUrl, payload);
  }

  // DELETE asset
  deleteAsset$(assetId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${assetId}`);
  }
  // ✅ STATUS API
  getAssetStatuses$() {
    return this.http.get<AssetStatus[]>(`${this.apiUrl}/statuses`);
  }
 // ✅ NEW: Get all employees

getAllEmployees$(): Observable<EmployeeDto[]> {
    return this.http.get<EmployeeDto[]>(`${this.apiUrl}/employees`);
}
// ✅ Manager – get pending approvals
getPendingApprovals$(managerUserId: number): Observable<AssetDto[]> {
  const params = new HttpParams().set('managerUserId', managerUserId);
  return this.http.get<AssetDto[]>(
    `${this.apiUrl}/manager/pending-approvals`,
    { params }
  );
}

// ✅ Manager – approve or reject (single API)
approveOrRejectAsset$(
  assetId: number,
  managerUserId: number,
  action: 'Approve' | 'Reject'
): Observable<any> {
  const params = new HttpParams()
    .set('assetId', assetId)
    .set('managerUserId', managerUserId)
    .set('action', action);

  return this.http.get(
    `${this.apiUrl}/manager/approval-action`,
    { params }
  );
}

}
