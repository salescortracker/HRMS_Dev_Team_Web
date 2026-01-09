import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,HttpErrorResponse  } from '@angular/common/http';

import { forkJoin } from 'rxjs';
import { map } from 'rxjs';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// ------------ Model Interfaces ----------------
export interface Designation {
  designationID: number;
  companyId: number;
  regionId: number;
  designationName: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: Date;
  modifiedBy?: string;
  modifiedAt?: Date;
  isDeleted?: boolean;
}
export interface AssetStatus {
  AssetStatusID: number;
  AssetStatusName: string;
  IsActive: boolean;
  CompanyID: number;
  RegionID: number;
}
export interface PolicyCategory {
  PolicyCategoryID?: number;
  CompanyID: number;
  RegionID: number;
  PolicyCategoryName: string;
  IsActive: boolean;
}
export interface AttachmentType {
  AttachmentTypeID?: number;
  AttachmentTypeName: string;
  IsActive: boolean;
  CompanyID: number;   // <-- add this
  RegionID: number;    // <-- add this
}
export interface ProjectStatus {
  ProjectStatusID: number;
  ProjectStatusName: string;
  IsActive: boolean;
  CompanyID: number;
  RegionID: number;
}
export interface AttendanceStatus {
  AttendanceStatusID: number;
  AttendanceStatusName: string;
  IsActive: boolean;
  CompanyID: number;
  RegionID: number;

  
}
export interface ExpenseCategory {
  ExpenseCategoryID: number;
  ExpenseCategoryName: string;
  IsActive: boolean;
  CompanyID: number;
  RegionID: number;
}
export interface LeaveStatus {
  LeaveStatusID: number;
  LeaveStatusName: string;
  IsActive: boolean;
  CompanyID: number;
  RegionID: number;
}
export interface LeaveType {
  LeaveTypeId: number;
  LeaveTypeName: string;
  LeaveDays: number;
  IsActive: boolean;
   CompanyID: number;
  RegionID: number;
}
export interface ExpenseStatus {
  ExpenseStatusID: number;
  ExpenseStatusName: string;
  IsActive: boolean;
  CompanyID: number;
  RegionID: number;
}
export interface Company {
  companyId: number;
  companyName: string;
  companyCode?: string;
  industryType?: string;
  headquarters?: string;
  isActive: boolean;
  CreatedBy?: string;
  CreatedDate?: Date;
  ModifiedBy?: string;
  ModifiedAt?: Date;
}
export interface MenuRoleDto {
  menuRoleId: number;
  roleId: number;
  roleName: string;
  menuId: number;
  menuName: string;
  menuUrl: string;
  orderNo: number;
  icon: string;
  parentId?: number;
  canView?: boolean;
  canAdd?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  isActive: boolean;
}
export interface HelpdeskCategory {
  HelpdeskCategoryID: number;
  CategoryName: string;
  IsActive: boolean;
  CompanyID: number;
  RegionID: number;
}
export interface KpiCategory {
  KpiCategoryID?: number;
  KpiCategoryName: string;
  IsActive: boolean;
  CompanyID?: number;
  RegionID?: number;
}

export interface Relationship {
  RelationshipID: number;
  RelationshipName: string;
  IsActive: boolean;
}
export interface MenuItem {
  label: string;           // <-- what UI expects
  link?: string;
  icon?: string;
  orderNo?: number;
  children?: MenuItem[];
}
export interface CertificationType {
  CertificationTypeID: number;
  CertificationTypeName: string;
  IsActive: boolean;
}
export interface BloodGroup {
  bloodGroupID: number;
  bloodGroupName: string;
  isActive: boolean;
}
export interface Gender {
  genderID: number;
  genderName: string;
  description?: string;
  isActive: boolean;
}

export interface Region {
  regionID: number;
  companyID: number;
  regionName: string;
  country: string;
  isActive: boolean;
}
export interface User {
  UserID?: number;
  companyId: number;
  regionId: number;
  employeeCode: string;
  fullName: string;
  email: string;
  roleId: number;
  password?: string;
  status: string;
}

export interface MenuMaster {
  menuID: number;
  menuName: string;
  parentMenuID?: number|null;
  url?: string;
  icon?: string;
  orderNo?: number;
  isActive: boolean | number;
  CreatedBy?: string;
  CreatedDate?: Date;
  ModifiedBy?: string;
  ModifiedAt?: Date;
}

export interface RoleMaster {
  roleId?: number| undefined;
  roleName: string;
  roleDescription?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: Date;
  modifiedBy?: string;
  modifiedAt?: Date;
}
export interface Department {
  departmentID: number;
  companyID: number;
  regionID: number;
  departmentName: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: Date;
  modifiedBy?: string;
  modifiedAt?: Date;
  isDeleted?: boolean;
}

export interface MaritalStatus {
  maritalStatusID: number;
  companyID: number;
  regionID: number;
  statusName: string;
  description?: string;
  isActive: boolean;
    companyName?: string;
  regionName?: string;
}


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'https://localhost:44370/api'; // 🔹 Change this to your actual API URL

  constructor(private http: HttpClient) {}
  // -------------------------------------------------------------
  // 🔹 GENERIC HELPERS
  // -------------------------------------------------------------

  private buildParams(params?: Record<string, any>): HttpParams {
    
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value);
        }
      });
    }
    return httpParams;
  }

  private getHeaders() {
    return {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
  }

  // Generic reusable CRUD
  private getAll<T>(endpoint: string, params?: Record<string, any>): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${endpoint}`, { params: this.buildParams(params) });
  }

  private getById<T>(endpoint: string, id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  private create<T>(endpoint: string, model: T): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, model, this.getHeaders());
  }

  private update<T>(endpoint: string, id: number, model: T): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}/${id}`, model, this.getHeaders());
  }

  private delete(endpoint: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  // -------------------------------------------------------------
  // 🔹 COMPANY OPERATIONS
  // -------------------------------------------------------------
  getCompanies(params?: any): Observable<Company[]> {
    return this.getAll<Company>('UserManagement/GetCompany', params);
  }

  getCompanyById(id: number): Observable<Company> {
    return this.getById<Company>('UserManagement/GetCompanyById', id);
  }

  createCompany(model: Company): Observable<Company> {
    return this.create<Company>('UserManagement/SaveCompany', model);
  }

  updateCompany(id: number, model: Company): Observable<Company> {
    return this.update<Company>('UserManagement/UpdateCompany', id, model);
  }

  deleteCompany(id: number): Observable<void> {
    return this.delete('UserManagement/DeleteCompany', id);
  }

  // -------------------------------------------------------------
  // 🔹 REGION OPERATIONS
  // -------------------------------------------------------------
  getRegions(params?: any): Observable<Region[]> {
    return this.getAll<Region>('UserManagement/GetRegion', params);
  }

  getRegionById(id: number): Observable<Region> {
    return this.getById<Region>('UserManagement/GetRegionById', id);
  }

  createRegion(model: Region): Observable<Region> {
    return this.create<Region>('UserManagement/SaveRegion', model);
  }

  updateRegion(id: number, model: Region): Observable<Region> {
    return this.update<Region>('UserManagement/UpdateRegion', id, model);
  }

  deleteRegion(id: number): Observable<void> {
    return this.delete('UserManagement/DeleteRegion', id);
  }

  // -------------------------------------------------------------
  // 🔹 USER OPERATIONS
  // -------------------------------------------------------------
  // getUsers(params?: any): Observable<User[]> {
  //   return this.getAll<User>('UserManagement/getUsers', params);
  // }

  // getUserById(id: number): Observable<User> {
  //   return this.getById<User>('UserManagement/getUserById', id);
  // }

  // createUser(model: User): Observable<User> {
  //   return this.create<User>('UserManagement/createUser', model);
  // }

  // updateUser(id: number, model: User): Observable<User> {
  //   return this.update<User>('UserManagement/updateUser', id, model);
  // }

  // deleteUser(id: number): Observable<void> {
  //   return this.delete('UserManagement/deleteUser', id);
  // }
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/UserManagement/GetAllUsers`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/UserManagement/GetUserById/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/UserManagement/CreateUser`, user);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/UserManagement/UpdateUser/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/UserManagement/DeleteUser/${id}`);
  }
  login(username: string, password: string): Observable<any> {
    const model = {email: username,password: password };
    return this.http.post<any>(`${this.baseUrl}/UserManagement/Login`, model).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Login API error:', error);
    return throwError(() => new Error('Unable to process login. Please try again later.'));
  }

  sendWelcomeEmail(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/UserManagement/SendEmail`, user);
  }

  // -------------------------------------------------------------
  // 🔹 MENU MASTER OPERATIONS
  // -------------------------------------------------------------
  getMenus(params?: any): Observable<MenuMaster[]> {
    return this.getAll<MenuMaster>('UserManagement/GetAllMenus', params);
  }

  getMenuById(id: number): Observable<MenuMaster> {
    return this.getById<MenuMaster>('UserManagement/GetMenuById', id);
  }

  createMenu(model: MenuMaster): Observable<MenuMaster> {
    return this.create<MenuMaster>('UserManagement/CreateMenu', model);
  }

  updateMenu(id: number, model: MenuMaster): Observable<MenuMaster> {
    return this.update<MenuMaster>('UserManagement/UpdateMenu', id, model);
  }

  deleteMenu(id: number): Observable<void> {
    return this.delete('UserManagement/DeleteMenu', id);
  }

  // -------------------------------------------------------------
  // 🔹 Role MASTER OPERATIONS
  // -------------------------------------------------------------
  getroles(params?: any): Observable<RoleMaster[]> {
    return this.getAll<RoleMaster>('UserManagement/GetAllRoles', params);
  }

  getrolesById(id: number): Observable<RoleMaster> {
    return this.getById<RoleMaster>('UserManagement/GetRoleById', id);
  }

  createRoles(model: RoleMaster): Observable<RoleMaster> {
    return this.create<RoleMaster>('UserManagement/CreateRole', model);
  }

  updateRoles(id: number, model: RoleMaster): Observable<RoleMaster> {
    return this.update<RoleMaster>('UserManagement/UpdateRole', id, model);
  }

  deleteRoles(id: number): Observable<void> {
    return this.delete('UserManagement/DeleteRole', id);
  }



  // ✅ Role Permission APIs
  getPermissionsByRole(roleId: number|undefined): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/UserManagement/get-permissions/${roleId}`);
  }

  assignPermissions(roleId: number, permissions: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/UserManagement/assign-permissions/${roleId}`, permissions);
  }

  // ✅ Combined loader: Menus + Role Permissions merged
  getMenusWithPermissions(roleId: number|undefined): Observable<any[]> {
    return forkJoin({
      menus: this.getMenus(),
      permissions: this.getPermissionsByRole(roleId)
    }).pipe(
      map(({ menus, permissions }) => this.mergePermissions(menus, permissions))
    );
  }
  getMenusByRoleId(roleId: number): Observable<MenuRoleDto[]> {
    return this.http
      .get<MenuRoleDto[]>(`${this.baseUrl}/UserManagement/GetAllMenusByRoleId/${roleId}`)
      .pipe(catchError(this.handleError));
  }

  

  private mergePermissions(menus: MenuMaster[], permissions: any[]): any[] {
  // Function recursively maps permissions to each menu item
  const mapPermissions = (menuList: MenuMaster[]): any[] => {
    return menuList.map((menu): any => {
      const perm = permissions.find(p => p.menuId === menu.menuID);

      const mappedMenu: any = {
        ...menu,
        expanded: false,
        selected: perm ? perm.isActive : false,
        permissions: {
          view: perm ? perm.canView : false,
          add: perm ? perm.canAdd : false,
          edit: perm ? perm.canEdit : false,
          delete: perm ? perm.canDelete : false,
          approve: perm ? perm.canApprove : false
        },
        children: [] as any[]
      };

      // Recursively process children
      const childMenus = menus.filter(m => m.parentMenuID === menu.menuID);
      if (childMenus.length > 0) {
        mappedMenu.children = mapPermissions(childMenus);
      }

      return mappedMenu;
    });
  };

  // Start with root-level menus
  const rootMenus = menus.filter(m => !m.parentMenuID);
  return mapPermissions(rootMenus);
}
bulkInsertData(entityName: string, data: any[]): Observable<any> {
  const payload = {
    entityName,
    data
  };
  return this.http.post(`${this.baseUrl}/UserManagement/BulkInsert`, payload);
}
// -------------------------------------------------------------
// 🔹 DEPARTMENT OPERATIONS
// -------------------------------------------------------------
getDepartments(): Observable<Department[]> {
  return this.getAll<Department>(`MasterData/GetDepartments`);
}

getDepartmentById(id: number): Observable<Department> {
  return this.getById<Department>(`MasterData/GetDepartmentById`, id);
}

createDepartment(model: Department): Observable<any> {
  return this.create<Department>(`MasterData/CreateDepartment`, model);
}

updateDepartment(id: number, model: Department): Observable<any> {
  return this.update<Department>(`MasterData/updateDepartment`, id, model);
}

deleteDepartment(id: number): Observable<any> {
  return this.http.post(`/MasterData/DeleteDepartment/${id}`, {}); // soft delete
}

getDesignations(): Observable<Designation[]> {
  return this.getAll<Designation>(`MasterData/GetDesignations`);
}

getDesignationById(id: number): Observable<Designation> {
  return this.getById<Designation>(`MasterData/GetDesignationById`, id);
}

createDesignation(model: Designation): Observable<any> {
  return this.create<Designation>(`MasterData/CreateDesignation`, model);
}

updateDesignation(id: number, model: Designation): Observable<any> {
  return this.update<Designation>(`MasterData/UpdateDesignation`, id, model);
}

deleteDesignation(id: number): Observable<any> {
  // Using POST for soft delete pattern as per your Department delete
  return this.http.post(`${this.baseUrl}/MasterData/DeleteDesignation/${id}`,{} );
}

getGenders() {
  return this.http.get<{ data: { data: Gender[] } }>(`${this.baseUrl}/Gender/GetAll`);
}

createGender(gender: Gender) {
  return this.http.post(`${this.baseUrl}/Gender/Create`, gender);
}

updateGender(id: number, gender: Gender) {
  return this.http.put(`${this.baseUrl}/Gender/Update/${id}`, gender);
}

deleteGender(id: number) {
  return this.http.delete(`${this.baseUrl}/Gender/Delete/${id}`);
}
// Example endpoints
getBloodGroups() {
  return this.http.get(`${this.baseUrl}/bloodgroups`);
}

createBloodGroup(data: any) {
  return this.http.post(`${this.baseUrl}/bloodgroups`, data);
}

updateBloodGroup(id: number, data: any) {
  return this.http.put(`${this.baseUrl}/bloodgroups/${id}`, data);
}

deleteBloodGroup(id: number) {
  return this.http.delete(`${this.baseUrl}/bloodgroups/${id}`);
}

// ---------------- RELATIONSHIP MASTER ---------------- //

getRelationships() {
  return this.http.get<any>(`${this.baseUrl}/relationship`);
}

createRelationship(data: any) {
  return this.http.post<any>(`${this.baseUrl}/relationship`, data);
}

updateRelationship(id: number, data: any) {
  return this.http.put<any>(`${this.baseUrl}/relationship/${id}`, data);
}

deleteRelationship(id: number) {
  return this.http.delete<any>(`${this.baseUrl}/relationship/${id}`);
}
 // Certification Type APIs
  getCertificationTypes(): Observable<CertificationType[]> {
    return this.http.get<CertificationType[]>(`${this.baseUrl}/CertificationType`);
  }

  createCertificationType(data: CertificationType): Observable<any> {
    return this.http.post(`${this.baseUrl}/CertificationType`, data);
  }

  updateCertificationType(id: number, data: CertificationType): Observable<any> {
    return this.http.put(`${this.baseUrl}/CertificationType/${id}`, data);
  }

  deleteCertificationType(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/CertificationType/${id}`);
  }
  // Policy Category

createPolicyCategory(policy: PolicyCategory) {
  return this.http.post(`${this.baseUrl}/PolicyCategory`, policy);
}

updatePolicyCategory(id: number, policy: PolicyCategory) {
  return this.http.put(`${this.baseUrl}/PolicyCategory/${id}`, policy);
}

deletePolicyCategory(id: number) {
  return this.http.delete(`${this.baseUrl}/PolicyCategory/${id}`);
}

// Get policy categories by company and region
  getPolicyCategories(companyID: number, regionID: number): Observable<PolicyCategory[]> {
    let params = new HttpParams()
      .set('CompanyID', companyID.toString())
      .set('RegionID', regionID.toString());

    return this.http.get<PolicyCategory[]>(`${this.baseUrl}/PolicyCategory`, { params });
  }
  // ---------- KPI CATEGORY ----------
createKpiCategory(model: KpiCategory) {
  return this.http.post(`${this.baseUrl}/KpiCategory/Create`, model);
}

getKpiCategories(companyId: number, regionId: number) {
  return this.http.get(`${this.baseUrl}/KpiCategory/GetAll`, {
    params: { companyId, regionId }
  });
}

getKpiCategoryById(id: number) {
  return this.http.get(`${this.baseUrl}/KpiCategory/GetById/${id}`);
}

updateKpiCategory(model: KpiCategory) {
  return this.http.put(`${this.baseUrl}/KpiCategory/Update`, model);
}

deleteKpiCategory(id: number) {
  return this.http.delete(`${this.baseUrl}/KpiCategory/Delete/${id}`);
}
getAttachmentTypes(companyId: number, regionId: number) {
  return this.http.get<any>(`${this.baseUrl}/AttachmentType/Get?companyId=${companyId}&regionId=${regionId}`);
}

createAttachmentType(data: AttachmentType) {
  return this.http.post<any>(`${this.baseUrl}/AttachmentType/Create`, data);
}

updateAttachmentType(data: AttachmentType) {
  return this.http.put<any>(`${this.baseUrl}/AttachmentType/Update`, data);
}

deleteAttachmentType(id: number) {
  return this.http.delete<any>(`${this.baseUrl}/AttachmentType/Delete/${id}`);
}
// GET all project statuses
  getProjectStatuses(companyId: number, regionId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/project-status?companyId=${companyId}&regionId=${regionId}`);
  }

  // CREATE
  createProjectStatus(status: ProjectStatus): Observable<any> {
    return this.http.post(`${this.baseUrl}/project-status`, status);
  }

  // UPDATE
  updateProjectStatus(status: ProjectStatus): Observable<any> {
    return this.http.put(`${this.baseUrl}/project-status/${status.ProjectStatusID}`, status);
  }

  // DELETE
  deleteProjectStatus(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/project-status/${id}`);
  }

  // GET all asset statuses
  getAssetStatuses(companyId: number, regionId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/asset-status?companyId=${companyId}&regionId=${regionId}`);
  }

  // CREATE
  createAssetStatus(status: AssetStatus): Observable<any> {
    return this.http.post(`${this.baseUrl}/asset-status`, status);
  }

  // UPDATE
  updateAssetStatus(status: AssetStatus): Observable<any> {
    return this.http.put(`${this.baseUrl}/asset-status/${status.AssetStatusID}`, status);
  }

  // DELETE
  deleteAssetStatus(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/asset-status/${id}`);
  }

  // GET all helpdesk categories
  getHelpdeskCategories(companyId: number, regionId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/helpdesk-category?companyId=${companyId}&regionId=${regionId}`);
  }

  // CREATE
  createHelpdeskCategory(category: HelpdeskCategory): Observable<any> {
    return this.http.post(`${this.baseUrl}/helpdesk-category`, category);
  }

  // UPDATE
  updateHelpdeskCategory(category: HelpdeskCategory): Observable<any> {
    return this.http.put(`${this.baseUrl}/helpdesk-category/${category.HelpdeskCategoryID}`, category);
  }

  // DELETE
  deleteHelpdeskCategory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/helpdesk-category/${id}`);
  }
 getAttendanceStatus(companyId: number, regionId: number) {
  return this.http.get<any>(`${this.baseUrl}/AttendanceStatus/GetAll?companyId=${companyId}&regionId=${regionId}`);
}

createAttendanceStatus(model: AttendanceStatus) {
  return this.http.post(`${this.baseUrl}/AttendanceStatus/Create`, model);
}

updateAttendanceStatus(model: AttendanceStatus) {
  return this.http.put(`${this.baseUrl}/AttendanceStatus/Update`, model);
}

deleteAttendanceStatus(id: number) {
  return this.http.delete(`${this.baseUrl}/AttendanceStatus/Delete?id=${id}`);
}
// ================= LEAVE STATUS ===================

// Get All
getLeaveStatus(companyId: number, regionId: number) {
  return this.http.get<any>(
    `${this.baseUrl}/LeaveStatus/GetLeaveStatus?CompanyID=${companyId}&RegionID=${regionId}`
  );
}

// Create
createLeaveStatus(data: LeaveStatus) {
  return this.http.post<any>(`${this.baseUrl}/LeaveStatus/CreateLeaveStatus`, data);
}

// Update
updateLeaveStatus(data: LeaveStatus) {
  return this.http.put<any>(`${this.baseUrl}/LeaveStatus/UpdateLeaveStatus`, data);
}

// Delete
deleteLeaveStatus(id: number) {
  return this.http.delete<any>(
    `${this.baseUrl}/LeaveStatus/DeleteLeaveStatus?LeaveStatusID=${id}`
  );
}
getLeaveType(companyId: number, regionId: number) {
  return this.http.get<any>(
    `${this.baseUrl}/LeaveStatus/GetLeaveStatus?CompanyID=${companyId}&RegionID=${regionId}`
  );
}

  createLeaveType(model: LeaveType): Observable<any> {
    return this.http.post(`${this.baseUrl}/Create`, model);
  }

  updateLeaveType(model: LeaveType): Observable<any> {
    return this.http.put(`${this.baseUrl}/Update`, model);
  }
deleteLeaveType(id: number) {
  return this.http.delete<any>(
    `${this.baseUrl}/LeaveStatus/DeleteLeaveStatus?LeaveStatusID=${id}`
  );
}
// EXPENSE STATUS CRUD

getExpenseStatus(companyId: number, regionId: number) {
  return this.http.get<any>(`${this.baseUrl}/GetExpenseStatus?companyId=${companyId}&regionId=${regionId}`);
}

createExpenseStatus(data: ExpenseStatus) {
  return this.http.post<any>(`${this.baseUrl}/CreateExpenseStatus`, data);
}

updateExpenseStatus(data: ExpenseStatus) {
  return this.http.put<any>(`${this.baseUrl}/UpdateExpenseStatus`, data);
}

deleteExpenseStatus(id: number) {
  return this.http.delete<any>(`${this.baseUrl}/DeleteExpenseStatus/${id}`);
}
 // ------------------ EXPENSE CATEGORY TYPE ------------------

createExpenseCategoryType(model: ExpenseCategory) {
  return this.http.post(`${this.baseUrl}/ExpenseCategoryType/Create`, model);
}

updateExpenseCategoryType(model: ExpenseCategory) {
  return this.http.put(`${this.baseUrl}/ExpenseCategoryType/Update`, model);
}

deleteExpenseCategoryType(id: number) {
  return this.http.delete<any>(`${this.baseUrl}/ExpenseCategoryType/Delete/${id}`);
}

getAllExpenseCategoryTypes(companyId: number, regionId: number) {
  return this.http.get<any>(
    `${this.baseUrl}/ExpenseCategoryType/GetAll/${companyId}/${regionId}`
  );
}

//martital status CRUD operations

   // ----------------- Marital Status -----------------
  getMaritalStatuses(): Observable<MaritalStatus[]> {
    // Must POST {} because backend uses [HttpPost("getall")]
    return this.http.post<MaritalStatus[]>(`${this.baseUrl}/UserManagement/getall`, {});
  }

  createMaritalStatus(data: MaritalStatus): Observable<any> {
    const fd = new FormData();
    fd.append('companyId', data.companyID.toString());
    fd.append('regionId', data.regionID.toString());
    fd.append('maritalStatusName', data.statusName);
    fd.append('description', data.description ?? '');
    fd.append('isActive', data.isActive.toString());
    return this.http.post(`${this.baseUrl}/UserManagement/create`, fd);
  }

  updateMaritalStatus(data: MaritalStatus): Observable<any> {
    const fd = new FormData();
    fd.append('id', data.maritalStatusID.toString());
    fd.append('companyId', data.companyID.toString());
    fd.append('regionId', data.regionID.toString());
    fd.append('maritalStatusName', data.statusName);
    fd.append('description', data.description ?? '');
    fd.append('isActive', data.isActive.toString());
    return this.http.post(`${this.baseUrl}/UserManagement/update`, fd);
  }

  deleteMaritalStatus(id: number): Observable<any> {
    const fd = new FormData();
    fd.append('id', id.toString());
    return this.http.post(`${this.baseUrl}/UserManagement/delete`, fd);
  }
}
