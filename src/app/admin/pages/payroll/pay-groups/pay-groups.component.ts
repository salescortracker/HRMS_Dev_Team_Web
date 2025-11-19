import { Component } from '@angular/core';
import { PayGroup } from '../../../layout/models/pay-groups.model';
@Component({
  selector: 'app-pay-groups',
  standalone: false,
  templateUrl: './pay-groups.component.html',
  styleUrl: './pay-groups.component.css'
})
export class PayGroupsComponent {
group: PayGroup = { Name: '', Description: '', IsActive: true };
  groups: PayGroup[] = [];
  isEditMode = false;
  searchText = '';
  currentPage = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.groups = [
      { Name: 'Salaried Staff', Description: 'Regular Salaried Employees', IsActive: true },
      { Name: 'Contract Staff', Description: 'Temporary Contract Employees', IsActive: true },
      { Name: 'Management', Description: 'Managers and Executives', IsActive: true }
    ];
  }

  onSubmit(): void {
    if (this.isEditMode) {
      const index = this.groups.findIndex(g => g.Name === this.group.Name);
      if (index > -1) this.groups[index] = { ...this.group };
      this.isEditMode = false;
    } else {
      this.groups.push({ ...this.group });
    }
    this.resetForm();
  }

  editGroup(g: PayGroup): void {
    this.group = { ...g };
    this.isEditMode = true;
  }

  deleteGroup(g: PayGroup): void {
    this.groups = this.groups.filter(x => x !== g);
  }

  resetForm(): void {
    this.group = { Name: '', Description: '', IsActive: true };
    this.isEditMode = false;
  }

  filteredGroups(): PayGroup[] {
    if (!this.searchText) return this.groups;
    return this.groups.filter(g => g.Name.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  paginatedGroups(): PayGroup[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredGroups().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredGroups().length / this.pageSize);
  }

  pagesArray(): number[] {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage = page;
  }
}
