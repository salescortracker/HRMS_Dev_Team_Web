import { Component, OnInit } from '@angular/core';
import { AdminService, ResignationType } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';
import { EmployeeResignation } from '../../employee-profile/Employee-Models/EmployeeResignation';
import { EmployeeResignationService } from '../../employee-profile/EmployeeInfoServices/employee-resignation.service';

type ColumnKey =
  | 'showIndex'
  | 'type'
  | 'notice'
  | 'lastDay'
  | 'reason'
  | 'status'
  | 'actions';

@Component({
  selector: 'app-employee-resignation',
  standalone: false,
  templateUrl: './employee-resignation.component.html',
  styleUrls: ['./employee-resignation.component.css']
})
export class EmployeeResignationComponent implements OnInit {

  resignationTypes: ResignationType[] = [];
  selectedResignationTypeId: number | null = null;
  noticePeriod: number | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
resignations: any[] = [];
reason: string = '';
currentUser: any;

  constructor(private adminService: AdminService) {
  }

  ngOnInit(): void {
      this.currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
       console.log(this.currentUser);
    this.loadResignationTypes();
      this.loadResignations(); // ✅ important

  }

  loadResignationTypes(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.adminService.getResignationTypes().subscribe({
      next: (data: any) => {
        console.log('API Response:', data);
        
        // TRY DIFFERENT MAPPING APPROACHES BASED ON YOUR API RESPONSE
        
        // Option 1: If API returns direct array
        if (Array.isArray(data)) {
          this.resignationTypes = this.mapResignationTypes(data);
        }
        // Option 2: If API returns object with data property
        else if (data && data.data && Array.isArray(data.data)) {
          this.resignationTypes = this.mapResignationTypes(data.data);
        }
        // Option 3: If API returns wrapped differently
        else if (data && Array.isArray(data.result) || Array.isArray(data.items)) {
          this.resignationTypes = this.mapResignationTypes(data.result || data.items);
        }
        else {
          console.error('Unexpected API response structure:', data);
          this.errorMessage = 'Unexpected data format received from server';
        }
        
        console.log('Mapped Resignation Types:', this.resignationTypes);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading resignation types:', err);
        this.errorMessage = 'Failed to load resignation types. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Helper method to map API response to our interface
  private mapResignationTypes(apiData: any[]): ResignationType[] {
    return apiData.map(item => {
      // Try different possible property names from API
      const id = item.resignationTypeId || item.id || item.typeId || item.ResignationTypeId || 0;
      const name = item.resignationTypeName || item.name || item.typeName || item.ResignationTypeName || 'Unknown';
      const noticePeriod = item.noticePeriod || item.noticePeriodDays || item.noticeDays || item.NoticePeriod || 0;
      
      return {
        resignationTypeId: id,
        resignationTypeName: name,
        noticePeriod: noticePeriod
      };
    });
  }

 onResignationTypeChange(): void {

  const selected = this.resignationTypes.find(
    x => x.resignationTypeId === this.selectedResignationTypeId
  );

  this.noticePeriod = selected ? selected.noticePeriod : null;
}
calculateLastWorkingDay(): string | null {
  if (!this.noticePeriod) return null;

  const today = new Date();
  today.setDate(today.getDate() + this.noticePeriod);

  return today.toISOString().substring(0, 10);

  resignations: EmployeeResignation[] = [];
  filteredResignations: EmployeeResignation[] = [];
  resignationModel: EmployeeResignation = { resignationType: '' };
  filter = { resignationType: '', fromDate: '', toDate: '' };

  message = '';
  isEditMode = false;
  dateError = '';
  formSubmitted = false;

  // Pagination
  pageSize = 5;
  currentPage = 1;
  totalPages = 1;
  totalPagesArray: number[] = [];

  // Session Values
  companyId = Number(sessionStorage.getItem("CompanyId"));
  regionId = Number(sessionStorage.getItem("RegionId"));
  // employeeCode = sessionStorage.getItem("EmployeeCode") || "";
  roleId = Number(sessionStorage.getItem("roleId"));

  constructor(private resignationService: EmployeeResignationService) {}

  ngOnInit(): void {
    this.loadResignations();
  }

  loadResignations() {
    this.resignationService.getAll(this.companyId, this.regionId, this.roleId).subscribe({
      next: (data) => {
        this.resignations = data;
        this.filteredResignations = data;
        this.updatePagination();
      },
      error: (err) => console.error('Error loading resignations:', err),
    });
  }

  // ---------------- FILTER --------------------
  applyFilter() {
    const typeInput = (this.filter.resignationType || '').trim().toLowerCase();
    const fromDate = this.filter.fromDate ? new Date(this.filter.fromDate) : null;
    const toDate = this.filter.toDate ? new Date(this.filter.toDate) : null;

    this.filteredResignations = this.resignations.filter(item => {
      const itemType = (item.resignationType || '').trim().toLowerCase();
      const itemDate = item.lastWorkingDay ? new Date(item.lastWorkingDay) : null;

      const typeMatch = typeInput ? itemType.includes(typeInput) : true;
      const dateMatch =
        (!fromDate || (itemDate && itemDate >= fromDate)) &&
        (!toDate || (itemDate && itemDate <= toDate));

      return typeMatch && dateMatch;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  columns: Record<ColumnKey, boolean> = {
    showIndex: true,
    type: true,
    notice: true,
    lastDay: true,
    reason: true,
    status: true,
    actions: true
  };

  allColumns: { key: ColumnKey; label: string; visible: boolean }[] = [
    { key: 'showIndex', label: '#', visible: true },
    { key: 'type', label: 'Type', visible: true },
    { key: 'notice', label: 'Notice Period', visible: true },
    { key: 'lastDay', label: 'Last Working Day', visible: true },
    { key: 'reason', label: 'Reason', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];

  updateVisibleColumns() {
    this.allColumns.forEach(col => {
      this.columns[col.key] = col.visible;
    });
  }

  resetFilter() {
    this.filter = { resignationType: '', fromDate: '', toDate: '' };
    this.filteredResignations = this.resignations;
    this.updatePagination();
  }

  // ---------------- Pagination --------------------
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredResignations.length / this.pageSize);
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ---------------- Validation --------------------
  validateLastWorkingDay() {
    this.dateError = '';
    if (!this.resignationModel.lastWorkingDay) return;

    const selectedDate = new Date(this.resignationModel.lastWorkingDay);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.dateError = 'Last working day must be today or a future date.';
    }
  }

  saveResignation(form: NgForm) {
    this.formSubmitted = true;
    this.message = '';

    Object.values(form.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });

    if (
      !this.resignationModel.resignationReason ||
      this.resignationModel.resignationReason.trim().length < 10 ||
      form.invalid ||
      this.dateError
    ) return;

    // Add CompanyId + RegionId before saving
    this.resignationModel.companyId = this.companyId;
    this.resignationModel.regionId = this.regionId;
    this.resignationModel.userId = this.roleId;
  // this.resignationModel.employeeId = sessionStorage.getItem("EmployeeCode") || '';
    
    const apiCall = this.isEditMode && this.resignationModel.resignationId
      ? this.resignationService.update(this.resignationModel.resignationId, this.resignationModel)
      : this.resignationService.create(this.resignationModel);

    apiCall.subscribe({
      next: () => {
        this.message = this.isEditMode
          ? 'Resignation updated successfully!'
          : 'Resignation submitted successfully!';
        this.resetForm(form);
        this.loadResignations();
      },
      error: (err) => {
        console.error('Error saving resignation:', err);
        this.message = err.error?.message || 'Failed to save resignation.';
      },
    });
  }

  editResignation(item: EmployeeResignation) {
    this.resignationModel = { ...item };
    this.isEditMode = true;
  }

deleteResignation(id: number) {
  if (confirm('Are you sure you want to delete this resignation?')) {
    
    this.resignationService.delete(id).subscribe({
      next: () => {
        this.message = 'Resignation deleted successfully!';
        this.loadResignations();
      },
      error: (err) =>
        (this.message = 'Failed to delete resignation: ' + err.message),
    });
  }
}


  resetForm(form: NgForm) {
    form.resetForm();
    this.resignationModel = { resignationType: '' };
    this.isEditMode = false;
    this.dateError = '';
    this.formSubmitted = false;
  }
}

submitResignation(): void {

  const selectedType = this.resignationTypes.find(
    x => x.resignationTypeId === this.selectedResignationTypeId
  );

  if (!selectedType) {
    Swal.fire('Warning', 'Please select resignation type', 'warning');
    return;
  }

const payload = {
  employeeId: this.currentUser.employeeId,
  resignationTypeId: selectedType.resignationTypeId, // ✅ REQUIRED
  resignationType: selectedType.resignationTypeName, // ✅ EXTRA (backend uses)
  noticePeriod: this.noticePeriod!,
  lastWorkingDay: this.calculateLastWorkingDay()!,
  resignationReason: this.reason,
  companyId: this.currentUser.companyId,
  regionId: this.currentUser.regionId,
  userId: this.currentUser.userId,
  roleId: this.currentUser.roleId
};


  console.log('Submitting payload:', payload);

  this.adminService.submitResignation(payload).subscribe({
    next: () => {
      Swal.fire('Success', 'Resignation submitted successfully', 'success');
      this.resetForm();
      this.loadResignations();
    },
    error: () => {
      Swal.fire('Error', 'Failed to submit resignation', 'error');
    }
  });
}
resetForm(): void {
  this.selectedResignationTypeId = null;
  this.noticePeriod = null;
  this.reason = '';
}


loadResignations(): void {
  
  if (!this.currentUser?.userId) return;

  this.adminService
    .getResignations(this.currentUser.userId)
    .subscribe(data => this.resignations = data);
    console.log(this.resignations)
}

} 