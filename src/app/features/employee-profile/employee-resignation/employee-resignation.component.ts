import { Component, OnInit } from '@angular/core';
import { AdminService, ResignationType } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';

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