import { Component } from '@angular/core';
interface PayrollComponent {
  Name: string;
  Type: 'Earning' | 'Deduction';
  IsActive: boolean;
}
@Component({
  selector: 'app-earnings-deductions',
  standalone: false,
  templateUrl: './earnings-deductions.component.html',
  styleUrl: './earnings-deductions.component.css'
})
export class EarningsDeductionsComponent {
 component: PayrollComponent = { Name: '', Type: 'Earning', IsActive: true };
  components: PayrollComponent[] = [];
  isEditMode = false;
  searchText: string = '';
  currentPage = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.components = [
      { Name: 'Basic', Type: 'Earning', IsActive: true },
      { Name: 'HRA', Type: 'Earning', IsActive: true },
      { Name: 'PF', Type: 'Deduction', IsActive: true }
    ];
  }

  onSubmit(): void {
    if (this.isEditMode) {
      const index = this.components.findIndex(c => c.Name === this.component.Name && c.Type === this.component.Type);
      if (index > -1) this.components[index] = { ...this.component };
      this.isEditMode = false;
    } else {
      this.components.push({ ...this.component });
    }
    this.resetForm();
  }

  editComponent(c: PayrollComponent): void {
    this.component = { ...c };
    this.isEditMode = true;
  }

  deleteComponent(c: PayrollComponent): void {
    this.components = this.components.filter(x => x !== c);
  }

  resetForm(): void {
    this.component = { Name: '', Type: 'Earning', IsActive: true };
    this.isEditMode = false;
  }

  filteredComponents(): PayrollComponent[] {
    if (!this.searchText) return this.components;
    return this.components.filter(c => c.Name.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  paginatedComponents(): PayrollComponent[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredComponents().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredComponents().length / this.pageSize);
  }

  pagesArray(): number[] {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage = page;
  }
}
