import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelpdeskCategory } from '../../../servies/admin.service';
@Component({
  selector: 'app-helpdesk-category',
  standalone: false,
  templateUrl: './helpdesk-category.component.html',
  styleUrl: './helpdesk-category.component.css'
})
export class HelpdeskCategoryComponent {
 
  companyId = 1;
  regionId = 1;

  category: HelpdeskCategory = this.getEmptyCategory();
  categories: HelpdeskCategory[] = [];
  categoriesModel: any = {};

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  currentPage = 1;
  pageSize = 5;

  sortColumn = 'HelpdeskCategoryID';
  sortDirection: 'asc' | 'desc' = 'desc';

  showUploadPopup = false;

  constructor(private adminService: AdminService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  getEmptyCategory(): HelpdeskCategory {
    return {
      HelpdeskCategoryID: 0,
      CategoryName: '',
      IsActive: true,
      CompanyID: this.companyId,
      RegionID: this.regionId
    };
  }

  loadCategories(): void {
    this.spinner.show();
    this.adminService.getHelpdeskCategories(this.companyId, this.regionId).subscribe({
      next: res => {
        this.categories = res.data?.data || res;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Helpdesk Categories.', 'error');
      }
    });
  }

  onSubmit(): void {
    this.spinner.show();
    if (this.isEditMode) {
      this.adminService.updateHelpdeskCategory(this.category).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Updated', `${this.category.CategoryName} updated successfully!`, 'success');
          this.loadCategories();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Update failed.', 'error');
        }
      });
    } else {
      this.adminService.createHelpdeskCategory(this.category).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Created', `${this.category.CategoryName} added successfully!`, 'success');
          this.loadCategories();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Create failed.', 'error');
        }
      });
    }
  }

  editCategory(c: HelpdeskCategory): void {
    this.category = { ...c };
    this.isEditMode = true;
  }

  deleteCategory(c: HelpdeskCategory): void {
    Swal.fire({
      title: `Delete ${c.CategoryName}?`,
      showDenyButton: true,
      confirmButtonText: 'Confirm'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteHelpdeskCategory(c.HelpdeskCategoryID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted', `${c.CategoryName} deleted successfully.`, 'success');
            this.loadCategories();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed.', 'error');
          }
        });
      }
    });
  }

  resetForm(): void {
    this.category = this.getEmptyCategory();
    this.isEditMode = false;
  }

  /** Filtering + Sorting + Pagination */
  filteredCategories(): HelpdeskCategory[] {
    return this.categories.filter(c => {
      const matchesSearch = c.CategoryName.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.statusFilter === '' || c.IsActive === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  sortTable(column: string) {
    if (this.sortColumn === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else this.sortColumn = column; this.sortDirection = 'asc';
  }

  get pagedCategories(): HelpdeskCategory[] {
    const filtered = this.filteredCategories();
    filtered.sort((a: any, b: any) => {
      const valA = a[this.sortColumn]?.toString().toLowerCase() || '';
      const valB = b[this.sortColumn]?.toString().toLowerCase() || '';
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCategories().length / this.pageSize) || 1;
  }

  goToPage(page: number): void {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  /** Export */
  exportAs(type: 'excel' | 'pdf') {
    type === 'excel' ? this.exportExcel() : this.exportPDF();
  }

  exportExcel() {
    const data = this.categories.map(c => ({
      'Helpdesk Category': c.CategoryName,
      'Active': c.IsActive ? 'Yes' : 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'HelpdeskCategories');
    XLSX.writeFile(wb, 'HelpdeskCategories.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const data = this.categories.map(c => [c.CategoryName, c.IsActive ? 'Yes' : 'No']);
    autoTable(doc, { head: [['Category', 'Active']], body: data });
    doc.save('HelpdeskCategories.pdf');
  }

  /** Bulk Upload */
  openUploadPopup() { this.showUploadPopup = true; }
  closeUploadPopup() { this.showUploadPopup = false; }

  onBulkUploadComplete(data: any): void {
    if (!data || !data.length) {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
      return;
    }
    this.adminService.bulkInsertData('HelpdeskCategory', data).subscribe({
      next: () => {
        Swal.fire('Success', 'Helpdesk Category data uploaded successfully!', 'success');
        this.loadCategories();
        this.closeUploadPopup();
      },
      error: () => Swal.fire('Error', 'Failed to upload data.', 'error')
    });
  }
}
