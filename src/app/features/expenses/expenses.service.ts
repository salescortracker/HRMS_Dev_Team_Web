import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
export interface Expense {
  expenseId: number;
  projectName: string;
  location: string;
  country: string;
  expenseCategoryId: number;
  expenseCategoryName?: string;
  departmentId?: number | null;
  currencyCode: string;
  amount: number;
  expenseDate: string;
  reason: string;
  userId: number;
  userFullName?: string;
  companyId: number;
  regionId: number;
  receiptPath?: string;
  status?: string;
  checked?: boolean;
  visible?: boolean;
}

export interface ExpenseApprovalDto {
  expenseIds: number[];
  action: string; // "Approved" or "Rejected"
  managerId: number; // must match backend
}

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
   private baseUrl = 'https://localhost:44370/api/Expense';


  constructor(private http: HttpClient) {}

  createExpense(formData: FormData) {
    return this.http.post<any>(`${this.baseUrl}/Create`, formData);
  }

 getExpensesByUser(userId: number) {
  return this.http.get<any>(`${this.baseUrl}/GetByUser/${userId}`);
}


   // ----------------------------------------------------
  // GET EXPENSE LIMIT (FIXED)
  // ----------------------------------------------------
  getExpenseLimit(
    companyId: number,
    regionId: number,
    departmentId: number | null,   // ✅ FIX
    categoryId: number
  ): Observable<any> {

    let params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('regionId', regionId.toString())
      .set('categoryId', categoryId.toString());

    // ✅ Only append departmentId if available
    if (departmentId !== null) {
      params = params.set('departmentId', departmentId.toString());
    }

    return this.http.get<any>(
      `${this.baseUrl}/GetLimit`,
      { params }
    );
  }


 // ✅ Call new API without parameters
 getExpenseCategories(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/GetCategories`);
}

// ----------------------------------------------------
// GET EXPENSES FOR MANAGER APPROVAL
// ----------------------------------------------------
getExpensesForApproval(managerId: number): Observable<any> {
  return this.http.get<any>(
    `${this.baseUrl}/GetForApproval/${managerId}`
  );
}

// ----------------------------------------------------
// APPROVE / REJECT EXPENSES
// ----------------------------------------------------
approveRejectExpenses(payload: ExpenseApprovalDto): Observable<any> {
  return this.http.post<any>(
    `${this.baseUrl}/ApproveReject`,
    payload
  );
}
 getAllExpenses(): Observable<{ success: boolean, data: Expense[] }> {
    return this.http.get<{ success: boolean, data: Expense[] }>(`${this.baseUrl}/GetAll`);
  }


}
