import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService, Company, Region } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ExpenseStatus } from '../../../servies/admin.service';
export interface ExpenseStatusView extends ExpenseStatus {
  companyName: string;
  regionName: string;
}

@Component({
  selector: 'app-expense-status',
  standalone: false,
  templateUrl: './expense-status.component.html',
  styleUrl: './expense-status.component.css'
})
export class ExpenseStatusComponent implements OnInit {
    expenseList: ExpenseStatus[] = [];
  expense!: ExpenseStatus;

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';

  pageSize = 5;
  currentPage = 1;

  sortColumn = 'ExpenseStatusID';
  sortDirection: 'asc' | 'desc' = 'desc';

  showUploadPopup = false;
companyMap: { [key: number]: string } = {};
regionMap: { [key: number]: string } = {};

  // 🔹 Company / Region
  companies: Company[] = [];
  regions: Region[] = [];

  companyId: number = +(sessionStorage.getItem('CompanyId') || 0);
  regionId: number = +(sessionStorage.getItem('RegionId') || 0);

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

ngOnInit(): void {
  this.expense = this.getEmptyExpense();
  this.loadCompanies(); // 🔹 maps built here
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

  // ================= LOAD COMPANY & REGION =================

  loadCompanies(): void {
  this.adminService.getCompanies().subscribe({
    next: res => {
      this.companies = res || [];
      this.companyMap = {};

      this.companies.forEach(c =>
        this.companyMap[c.companyId] = c.companyName
      );

      if (this.companyId) {
        this.loadRegions();
      } else {
        this.loadExpenseStatus(); // fallback
      }
    }
  });
}


loadRegions(): void {
  if (!this.companyId) return;

  this.adminService.getRegions(this.companyId).subscribe({
    next: res => {
      this.regions = res || [];
      this.regionMap = {};

      this.regions.forEach(r =>
        this.regionMap[r.regionID] = r.regionName
      );

      this.loadExpenseStatus(); // ✅ NOW names can bind
    }
  });
}



  onCompanyChange(): void {
    sessionStorage.setItem('CompanyId', this.companyId.toString());
    this.regionId = 0;
    this.regions = [];
    this.loadRegions();
    this.expense.CompanyID = this.companyId;
  }

  onRegionChange(): void {
    sessionStorage.setItem('RegionId', this.regionId.toString());
    this.expense.RegionID = this.regionId;
  }

  // ================= LOAD =================

 loadExpenseStatus(): void {
  this.spinner.show();

  this.adminService.getExpenseStatus().subscribe({
    next: (res: any) => {
      const rawList = res.data || [];

      this.expenseList = rawList.map((x: any) => ({
        ExpenseStatusID: x.expenseStatusID,
        ExpenseStatusName: x.expenseStatusName,
        CompanyID: x.companyID,
        RegionID: x.regionID,
        IsActive: x.isActive,
        CompanyName: this.companyMap[x.companyID] || '—',
        RegionName: this.regionMap[x.regionID] || '—'
      }));

      this.currentPage = 1;
      this.spinner.hide();
    },
    error: () => {
      this.spinner.hide();
      Swal.fire('Error', 'Failed to load Expense Status', 'error');
    }
  });
}


  // ================= SAVE =================

  onSubmit(): void {
    this.expense.CompanyID = this.companyId;
    this.expense.RegionID = this.regionId;

    this.spinner.show();

    this.adminService.saveExpenseStatus(this.expense).subscribe({
      next: () => {
        this.spinner.hide();
        Swal.fire(
          this.isEditMode ? 'Updated!' : 'Created!',
          `Expense Status ${this.isEditMode ? 'updated' : 'created'} successfully.`,
          'success'
        );
        this.resetForm();
        this.loadExpenseStatus();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Save failed', 'error');
      }
    });
  }

 editExpense(e: ExpenseStatus): void {
  this.expense = { ...e };
  this.isEditMode = true;

  this.companyId = e.CompanyID || 0;
  this.regionId = e.RegionID || 0;

  this.loadRegions();
}


  deleteExpense(item: ExpenseStatus): void {
    Swal.fire({
      title: `Delete "${item.ExpenseStatusName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(res => {
      if (res.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteExpenseStatus(item.ExpenseStatusID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted!', 'Expense Status deleted.', 'success');
            this.loadExpenseStatus();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed', 'error');
          }
        });
      }
    });
  }

  resetForm(): void {
    this.expense = this.getEmptyExpense();
    this.isEditMode = false;
  }

  // ================= FILTER / SORT =================

  filteredExpense(): ExpenseStatus[] {
    const search = this.searchText.toLowerCase();
    return this.expenseList.filter(x =>
      x.ExpenseStatusName.toLowerCase().includes(search) &&
      (this.statusFilter === '' || x.IsActive === this.statusFilter)
    );
  }

  get pagedExpense(): ExpenseStatus[] {
    const filtered = this.filteredExpense();
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredExpense().length / this.pageSize);
  }

  // ================= EXPORT =================
exportAs(type: 'excel' | 'pdf'): void {
  type === 'excel' ? this.exportExcel() : this.exportPDF();
}

  exportExcel() {
    const data = this.filteredExpense().map(e => ({
      'Expense Status': e.ExpenseStatusName,
      'Active': e.IsActive ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expense Status');
    XLSX.writeFile(wb, 'ExpenseStatus.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const data = this.filteredExpense().map(e => [
      e.ExpenseStatusName,
      e.IsActive ? 'Active' : 'Inactive'
    ]);

    autoTable(doc, {
      head: [['Expense Status', 'Status']],
      body: data
    });

    doc.save('ExpenseStatus.pdf');
  }
  openUploadPopup(): void {
  this.showUploadPopup = true;
}

closeUploadPopup(): void {
  this.showUploadPopup = false;
}

onBulkUploadComplete(event: any): void {
  this.showUploadPopup = false;
  this.loadExpenseStatus();
}

sortTable(column: string): void {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  this.expenseList.sort((a: any, b: any) => {
    const valA = a[column];
    const valB = b[column];
    return valA < valB
      ? (this.sortDirection === 'asc' ? -1 : 1)
      : valA > valB
      ? (this.sortDirection === 'asc' ? 1 : -1)
      : 0;
  });
}

getSortIcon(column: string): string {
  if (this.sortColumn !== column) return 'fa-sort';
  return this.sortDirection === 'asc'
    ? 'fa-sort-up'
    : 'fa-sort-down';
}
changePage(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }
}

}