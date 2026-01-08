import { Component, OnInit } from '@angular/core';
import { AdminService, PolicyCategory } from '../../../servies/admin.service';
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
selectedFile!: File;

  // Set default company and region IDs
  companyID = sessionStorage.getItem('CompanyID')
    ? parseInt(sessionStorage.getItem('CompanyID')!)
    : 1;
  regionID = sessionStorage.getItem('RegionID')
    ? parseInt(sessionStorage.getItem('RegionID')!)
    : 1;

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
    companyId: Number(sessionStorage.getItem('CompanyId')) || 0,
    regionId: Number(sessionStorage.getItem('RegionId')) || 0,
    userId: Number(JSON.parse(sessionStorage.getItem('currentUser') || '{}')?.userId) || 1,
    policyCategoryName: '',
    description: '',
    isActive: true
  };
}






  // Load policies
loadPolicies(): void {
  this.spinner.show();
  this.adminService.getPolicyCategories().subscribe({
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


  onSubmit(): void {

  if (!this.policy.policyCategoryName.trim()) {
    Swal.fire('Error', 'Policy Category Name is required', 'error');
    return;
  }

  // 🔥 FORCE correct values before API call
  this.policy.companyId = Number(sessionStorage.getItem('CompanyId'));
  this.policy.regionId  = Number(sessionStorage.getItem('RegionId'));
  this.policy.userId    =
    Number(JSON.parse(sessionStorage.getItem('currentUser') || '{}')?.userId) || 1;
  this.policy.isActive = true;

  if (this.isEditMode && this.policy.policyCategoryId) {
    this.adminService
      .updatePolicyCategory(this.policy.policyCategoryId, this.policy)
      .subscribe({
        next: () => {
          Swal.fire('Updated', 'Policy updated successfully!', 'success');
          this.loadPolicies();
          this.resetForm();
        },
        error: err => {
          console.error(err);
          Swal.fire('Error', 'Update failed', 'error');
        }
      });
  } else {
    this.adminService.createPolicyCategory(this.policy).subscribe({
      next: () => {
        Swal.fire('Added', 'Policy added successfully!', 'success');
        this.loadPolicies();
        this.resetForm();
      },
      error: err => {
        console.error(err);
        Swal.fire('Error', err.error || 'Create failed', 'error');
      }
    });
  }
}

  // Edit a policy
editPolicy(p: PolicyCategory): void {
  this.policy = {
    ...p,
    isActive: true   // 🔥 force ON
  };
  this.isEditMode = true;
}


  // Delete a policy
//  deletePolicy(p: PolicyCategory): void {
//   Swal.fire({
//     title: `Delete ${p.PolicyCategoryName}?`,
//     showCancelButton: true,
//     confirmButtonText: 'Confirm'
//   }).then(result => {
//     if (result.isConfirmed) {
//       const payload = {
//         ...p,
//         IsDeleted: true,
//         ModifiedBy: 1
//       };

//       this.adminService.updatePolicyCategory(p.PolicyCategoryID!, payload)
//         .subscribe({
//           next: () => {
//             Swal.fire('Deleted', 'Policy deleted successfully', 'success');
//             this.loadPolicies();
//           },
//           error: () => Swal.fire('Error', 'Delete failed', 'error')
//         });
//     }
//   });
// }


deletePolicy(p: PolicyCategory): void {
  Swal.fire({
    title: `Delete ${p.policyCategoryName}?`,
    showCancelButton: true,
    confirmButtonText: 'Confirm'
  }).then(result => {
    if (result.isConfirmed && p.policyCategoryId) {
      this.adminService.deletePolicyCategory(p.policyCategoryId).subscribe({
        next: () => {
          Swal.fire('Deleted', 'Policy deleted successfully', 'success');
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
    !this.searchText ||
    p.policyCategoryName
      ?.toLowerCase()
      .includes(this.searchText.toLowerCase())
  );
}

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
 uploadBulkPolicyCategories() {
  if (!this.selectedFile) {
    Swal.fire('Error', 'Please select an Excel file', 'error');
    return;
  }

  const companyId = Number(sessionStorage.getItem('CompanyId'));
  const regionId = Number(sessionStorage.getItem('RegionId'));
  const userId = Number(sessionStorage.getItem('roleId')); // or UserId if stored

  this.adminService
    .bulkUploadPolicyCategory(
      this.selectedFile,
      companyId,
      regionId,
      userId
    )
    .subscribe({
      next: () => {
        Swal.fire('Success', 'Bulk upload completed', 'success');
        this.closeUploadPopup();
        this.loadPolicies(); // refresh table
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Bulk upload failed', 'error');
      }
    });
}


  openUploadPopup() {
    this.showUploadPopup = true;
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
      this.selectedFile = undefined!;

  }
onFileSelected(event: any) {
  const file: File = event.target.files[0];

  if (!file) return;

  const companyId = Number(sessionStorage.getItem('CompanyId'));
  const regionId = Number(sessionStorage.getItem('RegionId'));
  const userId = Number(sessionStorage.getItem('currentUserId'));

  this.adminService
    .bulkUploadPolicyCategory(file, companyId, regionId, userId)
    .subscribe({
      next: () => Swal.fire('Success', 'Bulk upload completed', 'success'),
      error: () => Swal.fire('Error', 'Bulk upload failed', 'error')
    });
}


uploadBulk() {
  debugger;
  if (!this.selectedFile) {
    alert('Please select file');
    return;
  }

  const formData = new FormData();
  formData.append('file', this.selectedFile);

  const companyId = Number(sessionStorage.getItem('CompanyId'));
  const regionId = Number(sessionStorage.getItem('RegionId'));
const userId = Number(JSON.parse(sessionStorage.getItem('currentUser') || '{}')?.userId) || 1;

  this.adminService.bulkUploadPolicyCategory(this.selectedFile, companyId, regionId, userId
  ).subscribe({
    next: () => {
      alert('Bulk upload successful');
      this.closeUploadPopup();
      this.loadPolicies();
    },
    error: err => {
      console.error(err);
      alert('Bulk upload failed');
    }
  });
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
      CompanyID: p.companyId,
      RegionID: p.regionId,
      'Policy Category': p.policyCategoryName,
      Status: p.isActive ? 'Active' : 'Inactive'
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
      p.companyId,
      p.regionId,
      p.policyCategoryName,
      p.isActive ? 'Active' : 'Inactive'
    ]);
    autoTable(doc, {
      head: [['CompanyID', 'RegionID', 'Policy Category', 'Status']],
      body: exportData
    });
    doc.save('PolicyCategoryList.pdf');
  }
lettersOnly(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;

    // Block numbers (0–9)
    if (charCode >= 48 && charCode <= 57) {
      event.preventDefault();
    }
  }
}
