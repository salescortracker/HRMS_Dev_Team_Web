import { Component, OnInit } from '@angular/core';
import { AdminService, BloodGroup } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-blood-group-master',
  standalone: false,
  templateUrl: './blood-group-master.component.html',
  styleUrl: './blood-group-master.component.css'
})
export class BloodGroupMasterComponent {
bloodGroups: BloodGroup[] = [];
  bloodGroup: BloodGroup = this.getEmptyBloodGroup();
  bloodGroupModel: any;
  showUploadPopup = false;
  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  pageSize = 5;
  currentPage = 1;

  sortColumn: string = 'bloodGroupID';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(private adminService: AdminService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.loadBloodGroups();
  }

  getEmptyBloodGroup(): BloodGroup {
    return { bloodGroupID: 0, bloodGroupName: '', isActive: true };
  }

  loadBloodGroups(): void {
    this.spinner.show();
    this.adminService.getBloodGroups().subscribe({
      next: (res: any) => {
        this.bloodGroups = res.data?.data || res;
        this.bloodGroups.sort((a: any, b: any) => b.bloodGroupID - a.bloodGroupID);
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load blood groups.', 'error');
      }
    });
  }

  onSubmit(): void {
    this.spinner.show();
    const request = this.isEditMode
      ? this.adminService.updateBloodGroup(this.bloodGroup.bloodGroupID, this.bloodGroup)
      : this.adminService.createBloodGroup(this.bloodGroup);

    request.subscribe({
      next: () => {
        this.spinner.hide();
        Swal.fire('Success', `${this.bloodGroup.bloodGroupName} saved successfully!`, 'success');
        this.loadBloodGroups();
        this.resetForm();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Operation failed. Please contact IT Administrator.', 'error');
      }
    });
  }

  editBloodGroup(b: BloodGroup): void {
    this.bloodGroup = { ...b };
    this.isEditMode = true;
  }

  deleteBloodGroup(b: BloodGroup): void {
    Swal.fire({
      title: `Are you sure you want to delete ${b.bloodGroupName}?`,
      showDenyButton: true,
      confirmButtonText: 'Confirm'
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteBloodGroup(b.bloodGroupID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted!', `${b.bloodGroupName} deleted successfully.`, 'success');
            this.loadBloodGroups();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed! Please contact IT Administrator.', 'error');
          }
        });
      }
    });
  }

  resetForm(): void {
    this.bloodGroup = this.getEmptyBloodGroup();
    this.isEditMode = false;
  }

  filteredBloodGroups(): BloodGroup[] {
    const search = this.searchText.toLowerCase();
    return this.bloodGroups.filter(b => {
      const matchesSearch = b.bloodGroupName.toLowerCase().includes(search);
      const matchesStatus = this.statusFilter === '' || b.isActive === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredBloodGroups().length / this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  // Sorting
  sortTable(column: string): void {
    if (this.sortColumn === column)
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  applySorting(): void {
    this.bloodGroups.sort((a: any, b: any) => {
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

  get pagedBloodGroups(): BloodGroup[] {
    const sorted = [...this.filteredBloodGroups()];
    this.applySorting();
    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  exportAs(type: 'excel' | 'pdf') {
    if (type === 'excel') this.exportExcel();
    else this.exportPDF();
  }

  exportExcel() {
    const exportData = this.bloodGroups.map(b => ({
      'Blood Group Name': b.bloodGroupName,
      'Status': b.isActive ? 'Active' : 'Inactive'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BloodGroups');
    XLSX.writeFile(wb, 'BloodGroupList.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const exportData = this.bloodGroups.map(b => [
      b.bloodGroupName,
      b.isActive ? 'Active' : 'Inactive'
    ]);
    autoTable(doc, { head: [['Blood Group Name', 'Status']], body: exportData });
    doc.save('BloodGroupList.pdf');
  }

  // Bulk Upload

  onBulkUploadComplete(data: any): void {
    if (data && data.length > 0) {
      this.adminService.bulkInsertData('BloodGroup', data).subscribe({
        next: () => {
          Swal.fire('Success', 'Blood Groups uploaded successfully!', 'success');
          this.loadBloodGroups();
          this.closeUploadPopup();
        },
        error: () => Swal.fire('Error', 'Failed to upload blood groups.', 'error')
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
}
