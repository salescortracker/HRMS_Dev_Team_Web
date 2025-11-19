import { Component, OnInit } from '@angular/core';
import { AdminService,PolicyCategory } from '../../../servies/admin.service'; 
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-policy-category',
  standalone: false,
  templateUrl: './policy-category.component.html',
  styleUrl: './policy-category.component.css'
})
export class PolicyCategoryComponent {
  
  policy: PolicyCategory = this.getEmptyPolicy();
  policies: PolicyCategory[] = [];
  isEditMode = false;
  searchText = '';
  pageSize = 5;
  currentPage = 1;
  showUploadPopup = false;

  // Set default company and region IDs
  companyID = 1;
  regionID = 1;

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadPolicies();
  }

  // Empty policy model
  getEmptyPolicy(): PolicyCategory {
    return {
      PolicyCategoryID: 0,
      CompanyID: this.companyID,
      RegionID: this.regionID,
      PolicyCategoryName: '',
      IsActive: true
    };
  }

  // Load policies
  loadPolicies(): void {
    this.spinner.show();
    this.adminService.getPolicyCategories(this.companyID, this.regionID).subscribe({
      next: (res: PolicyCategory[]) => {
        this.policies = res || [];
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Policy Category data.', 'error');
      }
    });
  }

  // Submit form (Create / Update)
  onSubmit(): void {
    if (!this.policy.CompanyID || !this.policy.RegionID) {
      Swal.fire('Error', 'CompanyID and RegionID are mandatory', 'error');
      return;
    }

    if (this.isEditMode) {
      this.adminService.updatePolicyCategory(this.policy.PolicyCategoryID!, this.policy).subscribe({
        next: () => {
          Swal.fire('Updated', `${this.policy.PolicyCategoryName} updated successfully!`, 'success');
          this.loadPolicies();
          this.resetForm();
        },
        error: () => Swal.fire('Error', 'Update failed', 'error')
      });
    } else {
      this.adminService.createPolicyCategory(this.policy).subscribe({
        next: (res:any) => {
        
          Swal.fire('Added', `${this.policy.PolicyCategoryName} added successfully!`, 'success');
          this.loadPolicies();
          this.resetForm();
        },
        error: () => Swal.fire('Error', 'Create failed', 'error')
      });
    }
  }

  // Edit a policy
  editPolicy(p: PolicyCategory): void {
    this.policy = { ...p };
    this.isEditMode = true;
  }

  // Delete a policy
  deletePolicy(p: PolicyCategory): void {
    Swal.fire({
      title: `Are you sure you want to delete ${p.PolicyCategoryName}?`,
      showDenyButton: true,
      confirmButtonText: 'Confirm'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deletePolicyCategory(p.PolicyCategoryID!).subscribe({
          next: () => {
            Swal.fire('Deleted', `${p.PolicyCategoryName} deleted successfully.`, 'success');
            this.loadPolicies();
          },
          error: () => Swal.fire('Error', 'Delete failed', 'error')
        });
      }
    });
  }

  // Reset form
  resetForm(): void {
    this.policy = this.getEmptyPolicy();
    this.isEditMode = false;
  }

  // Filtering
  filteredPolicies(): PolicyCategory[] {
    return this.policies.filter(p =>
      p.PolicyCategoryName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Pagination
  paginatedPolicies(): PolicyCategory[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPolicies().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredPolicies().length / this.pageSize);
  }

  pagesArray(): number[] {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage = page;
  }

  // Bulk Upload
  onBulkUploadComplete(data: any[]): void {
    if (data && data.length > 0) {
      data.forEach(d => {
        d.CompanyID = this.companyID;
        d.RegionID = this.regionID;
      });
      this.adminService.bulkInsertData('PolicyCategory', data).subscribe({
        next: () => {
          Swal.fire('Success', 'Policy Category data uploaded successfully!', 'success');
          this.loadPolicies();
          this.closeUploadPopup();
        },
        error: () => Swal.fire('Error', 'Failed to upload data.', 'error')
      });
    } else {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
    }
  }

  openUploadPopup() {
    this.showUploadPopup = true;
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
  }

  // Download Sample Excel for Bulk Upload
  downloadSample() {
    const sampleData = [
      { CompanyID: this.companyID, RegionID: this.regionID, PolicyCategoryName: 'Leave', IsActive: true },
      { CompanyID: this.companyID, RegionID: this.regionID, PolicyCategoryName: 'Travel', IsActive: true },
      { CompanyID: this.companyID, RegionID: this.regionID, PolicyCategoryName: 'IT', IsActive: false }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PolicyCategorySample');
    XLSX.writeFile(wb, 'PolicyCategorySample.xlsx');
  }

  // Export to Excel
  exportExcel() {
    const exportData = this.policies.map(p => ({
      CompanyID: p.CompanyID,
      RegionID: p.RegionID,
      'Policy Category': p.PolicyCategoryName,
      Status: p.IsActive ? 'Active' : 'Inactive'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PolicyCategories');
    XLSX.writeFile(wb, 'PolicyCategoryList.xlsx');
  }

  // Export to PDF
  exportPDF() {
    const doc = new jsPDF();
    const exportData = this.policies.map(p => [
      p.CompanyID,
      p.RegionID,
      p.PolicyCategoryName,
      p.IsActive ? 'Active' : 'Inactive'
    ]);
    autoTable(doc, {
      head: [['CompanyID', 'RegionID', 'Policy Category', 'Status']],
      body: exportData
    });
    doc.save('PolicyCategoryList.pdf');
  }

}
