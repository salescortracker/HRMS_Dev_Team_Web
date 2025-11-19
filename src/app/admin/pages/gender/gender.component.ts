import { Component, OnInit } from '@angular/core';
import { AdminService,Gender } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-gender',
  standalone: false,
  templateUrl: './gender.component.html',
  styleUrl: './gender.component.css'
})
export class GenderComponent  {
genderModel: any;
  genders: Gender[] = [];
  gender: Gender = this.getEmptyGender();
  showUploadPopup = false;
  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  pageSize = 5;
  currentPage = 1;
  Math = Math;

  constructor(
    private adminservice: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadGenders();
  }

  // ------------------------------------------------------------
  // 🔹 Empty Model
  // ------------------------------------------------------------
  getEmptyGender(): Gender {
    return {
      genderID: 0,
      genderName: '',
      description: '',
      isActive: true
    };
  }

  // ------------------------------------------------------------
  // 🔹 Load Genders
  // ------------------------------------------------------------
  loadGenders(): void {
    this.spinner.show();
    this.adminservice.getGenders().subscribe({
      next: (res: any) => {
        this.genders = res.data?.data || res;
        // sort by latest
        this.genders.sort((a: any, b: any) => b.genderID - a.genderID);
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load genders.', 'error');
      }
    });
  }

  // ------------------------------------------------------------
  // 🔹 Submit (Add / Update)
  // ------------------------------------------------------------
  onSubmit(): void {
    this.spinner.show();
    if (this.isEditMode) {
      this.adminservice.updateGender(this.gender.genderID, this.gender).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Success', `${this.gender.genderName} updated successfully!`, 'success');
          this.loadGenders();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Update failed. Please contact IT Administrator.', 'error');
        }
      });
    } else {
      this.adminservice.createGender(this.gender).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Success', `${this.gender.genderName} added successfully!`, 'success');
          this.loadGenders();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Create failed. Please contact IT Administrator.', 'error');
        }
      });
    }
  }

  // ------------------------------------------------------------
  // 🔹 Edit Gender
  // ------------------------------------------------------------
  editGender(g: Gender): void {
    this.gender = { ...g };
    this.isEditMode = true;
  }

  // ------------------------------------------------------------
  // 🔹 Delete Gender
  // ------------------------------------------------------------
  deleteGender(g: Gender): void {
    Swal.fire({
      title: `Are you sure you want to delete ${g.genderName}?`,
      showDenyButton: true,
      confirmButtonText: 'Confirm'
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminservice.deleteGender(g.genderID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted!', `${g.genderName} deleted successfully.`, 'success');
            this.loadGenders();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed! Please contact IT Administrator.', 'error');
          }
        });
      }
    });
  }

  // ------------------------------------------------------------
  // 🔹 Reset Form
  // ------------------------------------------------------------
  resetForm(): void {
    this.gender = this.getEmptyGender();
    this.isEditMode = false;
  }

  // ------------------------------------------------------------
  // 🔹 Filter & Search
  // ------------------------------------------------------------
  filteredGenders(): Gender[] {
    const search = this.searchText.toLowerCase();
    return this.genders.filter(g => {
      const matchesSearch = g.genderName.toLowerCase().includes(search);
      const matchesStatus = this.statusFilter === '' || g.isActive === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  // ------------------------------------------------------------
  // 🔹 Pagination
  // ------------------------------------------------------------
  get totalPages(): number {
    return Math.ceil(this.filteredGenders().length / this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  changePageSize(event: any): void {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
  }

  // ------------------------------------------------------------
  // 🔹 Export (Excel / PDF)
  // ------------------------------------------------------------
  exportAs(type: 'excel' | 'pdf') {
    if (type === 'excel') this.exportExcel();
    else this.exportPDF();
  }

  exportExcel() {
    const exportData = this.genders.map(g => ({
      'Gender Name': g.genderName,
      'Description': g.description || '',
      'Status': g.isActive ? 'Active' : 'Inactive'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Genders');
    XLSX.writeFile(wb, 'GenderList.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const exportData = this.genders.map(g => [
      g.genderName,
      g.description || '',
      g.isActive ? 'Active' : 'Inactive'
    ]);
    autoTable(doc, {
      head: [['Gender Name', 'Description', 'Status']],
      body: exportData
    });
    doc.save('GenderList.pdf');
  }

  // ------------------------------------------------------------
  // 🔹 Bulk Upload
  // ------------------------------------------------------------
  gendermodel: any = {
    genderName: 'Male',
    description: 'Default Gender Example',
    isActive: true
  };

  onBulkUploadComplete(data: any): void {
    if (data && data.length > 0) {
      this.adminservice.bulkInsertData('Gender', data).subscribe({
        next: () => {
          Swal.fire('Success', 'Genders uploaded successfully!', 'success');
          this.loadGenders();
          this.closeUploadPopup();
        },
        error: () => Swal.fire('Error', 'Failed to upload genders.', 'error')
      });
    } else {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
    }
  }

  openUploadPopup() {
    this.showUploadPopup = false;
    setTimeout(() => (this.showUploadPopup = true), 0);
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
  }

  // ------------------------------------------------------------
  // 🔹 Sorting
  // ------------------------------------------------------------
  sortColumn: string = 'genderID';
  sortDirection: 'asc' | 'desc' = 'desc';

  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  applySorting(): void {
    this.genders.sort((a: any, b: any) => {
      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // ------------------------------------------------------------
  // 🔹 Paginated Genders
  // ------------------------------------------------------------
  get pagedGenders(): Gender[] {
    const sorted = [...this.filteredGenders()];
    this.applySorting();
    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }
}
