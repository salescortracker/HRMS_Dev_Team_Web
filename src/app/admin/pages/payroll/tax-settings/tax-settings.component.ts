import { Component } from '@angular/core';
import { TaxSetting } from '../../../layout/models/tax-setting.model';
@Component({
  selector: 'app-tax-settings',
  standalone: false,
  templateUrl: './tax-settings.component.html',
  styleUrl: './tax-settings.component.css'
})
export class TaxSettingsComponent {
 tax: TaxSetting = { Name: '', Type: '', Rate: 0, IsActive: true };
  taxes: TaxSetting[] = [];
  isEditMode = false;
  searchText = '';
  currentPage = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.taxes = [
      { Name: 'Income Tax', Type: 'Income Tax', Rate: 10, EffectiveDate: new Date(), IsActive: true },
      { Name: 'Professional Tax', Type: 'Professional Tax', Rate: 200, EffectiveDate: new Date(), IsActive: true }
    ];
  }

  onSubmit(): void {
    if (this.isEditMode) {
      const index = this.taxes.findIndex(t => t.Name === this.tax.Name && t.Type === this.tax.Type);
      if (index > -1) this.taxes[index] = { ...this.tax };
      this.isEditMode = false;
    } else {
      this.taxes.push({ ...this.tax });
    }
    this.resetForm();
  }

  editTax(t: TaxSetting): void {
    this.tax = { ...t };
    this.isEditMode = true;
  }

  deleteTax(t: TaxSetting): void {
    this.taxes = this.taxes.filter(x => x !== t);
  }

  resetForm(): void {
    this.tax = { Name: '', Type: '', Rate: 0, IsActive: true };
    this.isEditMode = false;
  }

  filteredTaxes(): TaxSetting[] {
    if (!this.searchText) return this.taxes;
    return this.taxes.filter(t => t.Name.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  paginatedTaxes(): TaxSetting[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTaxes().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredTaxes().length / this.pageSize);
  }

  pagesArray(): number[] {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage = page;
  }

}
