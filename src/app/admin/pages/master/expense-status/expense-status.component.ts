import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ExpenseStatus } from '../../../servies/admin.service';
@Component({
  selector: 'app-expense-status',
  standalone: false,
  templateUrl: './expense-status.component.html',
  styleUrl: './expense-status.component.css'
})
export class ExpenseStatusComponent {
 
  companyId = 1;
  regionId = 1;

  expense: ExpenseStatus = this.getEmptyExpense();
  expenseList: ExpenseStatus[] = [];
  expenseModel: any = {};

  searchText = '';
  statusFilter: boolean | '' = '';

  isEditMode = false;

  // Pagination
  currentPage = 1;
  pageSize = 5;

  // Sorting
  sortColumn = 'ExpenseStatusID';
  sortDirection: 'asc' | 'desc' = 'desc';

  showUploadPopup = false;

  constructor(private admin: AdminService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.loadExpenseStatus();
  }

  getEmptyExpense(): ExpenseStatus {
    return {
      ExpenseStatusID: 0,
      ExpenseStatusName: '',
      IsActive: true,
      CompanyID: this.companyId,
      RegionID: this.regionId
    };
  }

  loadExpenseStatus(): void {
    this.spinner.show();
    this.admin.getExpenseStatus(this.companyId, this.regionId).subscribe({
      next: res => {
        this.expenseList = res.data?.data || res;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Expense Status', 'error');
      }
    });
  }

  onSubmit(): void {
    this.spinner.show();

    if (this.isEditMode) {
      this.admin.updateExpenseStatus(this.expense).subscribe({
        next: () => {
          Swal.fire('Updated!', 'Expense Status updated successfully!', 'success');
          this.loadExpenseStatus();
          this.resetForm();
          this.spinner.hide();
        },
        error: () => {
          Swal.fire('Error', 'Update failed', 'error');
          this.spinner.hide();
        }
      });

    } else {
      this.admin.createExpenseStatus(this.expense).subscribe({
        next: () => {
          Swal.fire('Created!', 'Expense Status saved successfully!', 'success');
          this.loadExpenseStatus();
          this.resetForm();
          this.spinner.hide();
        },
        error: () => {
          Swal.fire('Error', 'Create failed', 'error');
          this.spinner.hide();
        }
      });
    }
  }

  editExpense(item: ExpenseStatus): void {
    this.expense = { ...item };
    this.isEditMode = true;
  }

  deleteExpense(item: ExpenseStatus): void {
    Swal.fire({
      title: `Delete "${item.ExpenseStatusName}"?`,
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(res => {
      if (res.isConfirmed) {
        this.spinner.show();
        this.admin.deleteExpenseStatus(item.ExpenseStatusID).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Expense Status deleted', 'success');
            this.loadExpenseStatus();
            this.spinner.hide();
          },
          error: () => {
            Swal.fire('Error', 'Delete failed', 'error');
            this.spinner.hide();
          }
        });
      }
    });
  }

  resetForm(): void {
    this.expense = this.getEmptyExpense();
    this.isEditMode = false;
  }

  filteredExpense(): ExpenseStatus[] {
    return this.expenseList.filter(x => {
      const matchText = x.ExpenseStatusName.toLowerCase().includes(this.searchText.toLowerCase());
      const matchStatus = this.statusFilter === '' || x.IsActive === this.statusFilter;
      return matchText && matchStatus;
    });
  }

  sortTable(column: string) {
    if (this.sortColumn === column)
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  get pagedExpense(): ExpenseStatus[] {
    const filtered = this.filteredExpense();

    filtered.sort((a: any, b: any) => {
      const A = (a[this.sortColumn] ?? '').toString().toLowerCase();
      const B = (b[this.sortColumn] ?? '').toString().toLowerCase();

      if (A < B) return this.sortDirection === 'asc' ? -1 : 1;
      if (A > B) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredExpense().length / this.pageSize) || 1;
  }

  goToPage(page: number): void {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;

    this.currentPage = page;
  }

  getSortIcon(column: string) {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  exportAs(type: 'excel' | 'pdf') {
    if (type === 'excel') this.exportExcel();
    else this.exportPDF();
  }

  exportExcel() {
    const data = this.expenseList.map(c => ({
      'Expense Status Name': c.ExpenseStatusName,
      'Active': c.IsActive ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Expense Status');
    XLSX.writeFile(wb, 'ExpenseStatus.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const data = this.expenseList.map(c => [c.ExpenseStatusName, c.IsActive ? 'Yes' : 'No']);

    autoTable(doc, {
      head: [['Expense Status', 'Active']],
      body: data
    });

    doc.save('ExpenseStatus.pdf');
  }

  openUploadPopup() { this.showUploadPopup = true; }
  closeUploadPopup() { this.showUploadPopup = false; }

  onBulkUploadComplete(data: any) {
    if (!data || !data.length) {
      Swal.fire('Warning', 'No valid data in uploaded file!', 'warning');
      return;
    }

    this.admin.bulkInsertData('ExpenseStatus', data).subscribe({
      next: () => {
        Swal.fire('Success', 'Expense Status uploaded!', 'success');
        this.loadExpenseStatus();
        this.closeUploadPopup();
      },
      error: () => Swal.fire('Error', 'Upload failed!', 'error')
    });
  }
}
