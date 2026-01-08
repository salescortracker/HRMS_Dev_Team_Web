import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminService, ExpenseCategory } from '../../../servies/admin.service';

@Component({
  selector: 'app-expense-category',
  standalone: false,
  templateUrl: './expense-category.component.html',
  styleUrl: './expense-category.component.css'
})
export class ExpenseCategoryComponent {
   companyId = sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : 1;
  regionId = sessionStorage.getItem('RegionId') ? Number(sessionStorage.getItem('RegionId')) : 1;

  expense: ExpenseCategory = this.getEmptyExpenseCategory();
  expenseList: ExpenseCategory[] = [];
  expensecategoryModel: any = {};
  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';

  currentPage = 1;
  pageSize = 5;

  sortColumn = 'ExpenseCategoryID';
  sortDirection: 'asc' | 'desc' = 'asc';

  showUploadPopup = false;

  constructor(private admin: AdminService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.loadExpenseCategory();
  }

  getEmptyExpenseCategory(): ExpenseCategory {
    return {
      expenseCategoryID: 0,
      expenseCategoryName: '',
      isActive: true,
      companyID: this.companyId,
      regionID: this.regionId
    };
  }

  loadExpenseCategory(): void {
    this.spinner.show();
    this.admin.getAllExpenseCategoryTypes(this.companyId, this.regionId).subscribe({
      next: res => {
         this.expenseList = res.data;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load Expense Category.', 'error');
      }
    });
  }

  onSubmit(): void {
    this.spinner.show();

    if (this.isEditMode) {
      this.admin.updateExpenseCategoryType(this.expense).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Updated', 'Expense Category updated successfully!', 'success');
          this.loadExpenseCategory();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Update failed.', 'error');
        }
      });
    } else {
      this.admin.createExpenseCategoryType(this.expense).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Created', 'Expense Category created successfully!', 'success');
          this.loadExpenseCategory();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Create failed.', 'error');
        }
      });
    }
  }

  editExpenseCategory(item: ExpenseCategory): void {
    this.expense = { ...item };
    this.isEditMode = true;
  }


  deleteExpenseCategory(item: ExpenseCategory): void {
    Swal.fire({
      title: `Delete "${item.expenseCategoryName}"?`,
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.admin.deleteExpenseCategoryType(item.expenseCategoryID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted', 'Expense Category deleted successfully.', 'success');
            this.loadExpenseCategory();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed.', 'error');
          }
        });
      }
    });
  }

  lettersOnly(event: KeyboardEvent) {
  if (!/^[a-zA-Z ]$/.test(event.key)) {
    event.preventDefault();
  }
}

  resetForm(): void {
    this.expense = this.getEmptyExpenseCategory();
    this.isEditMode = false;
  }

  filteredExpenseCategory(): ExpenseCategory[] {
    return this.expenseList.filter(c => {
      const matchSearch = c.expenseCategoryName.toLowerCase().includes(this.searchText.toLowerCase());
      const matchStatus = this.statusFilter === '' || c.isActive === this.statusFilter;
      return matchSearch && matchStatus;
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

  get pagedExpenseCategory(): ExpenseCategory[] {
    const filtered = this.filteredExpenseCategory();

    filtered.sort((a: any, b: any) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];

      return this.sortDirection === 'asc'
        ? valA < valB ? -1 : 1
        : valA > valB ? -1 : 1;
    });

    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredExpenseCategory().length / this.pageSize) || 1;
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

  exportAs(type: 'excel' | 'pdf') {
    type === 'excel' ? this.exportExcel() : this.exportPDF();
  }

  exportExcel() {
    const data = this.expenseList.map(c => ({
      'Category Name': c.expenseCategoryName,
      'Active': c.isActive ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Expense Category');
    XLSX.writeFile(wb, 'ExpenseCategory.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();

    const data = this.expenseList.map(c => [
      c.expenseCategoryName,
      c.isActive ? 'Yes' : 'No'
    ]);

    autoTable(doc, {
      head: [['Category Name', 'Active']],
      body: data
    });

    doc.save('ExpenseCategory.pdf');
  }

  openUploadPopup() {
    this.showUploadPopup = true;
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
  }

  onBulkUploadComplete(data: any): void {
    if (!data || !data.length) {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
      return;
    }

    this.admin.bulkInsertData('ExpenseCategory', data).subscribe({
      next: () => {
        Swal.fire('Success', 'Expense Category uploaded successfully!', 'success');
        this.loadExpenseCategory();
        this.closeUploadPopup();
      },
      error: () => Swal.fire('Error', 'Failed to upload data.', 'error')
    });
  }
}
