import { Component } from '@angular/core';
import { PayrollSetting } from '../../layout/models/payroll-settings.model';
@Component({
  selector: 'app-payroll-settings',
  standalone: false,
  templateUrl: './payroll-settings.component.html',
  styleUrl: './payroll-settings.component.css'
})
export class PayrollSettingsComponent {
searchText: string = '';
  pageSize: number = 5;
  currentPage: number = 1;
  isEditMode: boolean = false;

  componentTypes: string[] = ['Earnings', 'Deduction'];
  amountTypes: string[] = ['Fixed', 'Percentage'];

  newSetting: PayrollSetting = {
    id: 0,
    componentName: '',
    componentType: '',
    amountType: 'Fixed',
    amount: 0,
    isTaxable: false,
    isActive: true
  };

  settings: PayrollSetting[] = [
    { id: 1, componentName: 'Basic Salary', componentType: 'Earnings', amountType: 'Fixed', amount: 30000, isTaxable: true, isActive: true },
    { id: 2, componentName: 'HRA', componentType: 'Earnings', amountType: 'Percentage', amount: 20, isTaxable: false, isActive: true }
  ];

  addOrUpdateSetting() {
    if(this.isEditMode){
      const index = this.settings.findIndex(s => s.id === this.newSetting.id);
      if(index > -1) this.settings[index] = { ...this.newSetting };
    } else {
      this.newSetting.id = this.settings.length + 1;
      this.settings.push({ ...this.newSetting });
    }
    this.resetForm();
  }

  editSetting(setting: PayrollSetting) {
    this.newSetting = { ...setting };
    this.isEditMode = true;
  }

  deleteSetting(setting: PayrollSetting) {
    this.settings = this.settings.filter(s => s.id !== setting.id);
  }

  resetForm() {
    this.newSetting = {
      id: 0,
      componentName: '',
      componentType: '',
      amountType: 'Fixed',
      amount: 0,
      isTaxable: false,
      isActive: true
    };
    this.isEditMode = false;
  }

  filteredSettings() {
    return this.settings.filter(s => s.componentName.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  totalPages() {
    return Math.ceil(this.filteredSettings().length / this.pageSize);
  }

  pagesArray() {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  paginatedSettings() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSettings().slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if(page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
  }

}
