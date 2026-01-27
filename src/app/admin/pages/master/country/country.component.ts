import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

import { AdminService, Company, Country, Region } from '../../../servies/admin.service';



@Component({
  selector: 'app-country',
  standalone: false,
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {

  country: Country = this.emptyCountry();
  countryList: Country[] = [];

  companyDropdown: Company[] = [];
  regionDropdown: Region[] = [];

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';

  currentPage = 1;
  pageSize = 5;

  sortColumn: keyof Country = 'countryName';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadRegions();
    this.loadCountries();
  }

  emptyCountry(): Country {
    return {
      countryId: 0,
      countryName: '',
      companyId: 0,
      regionId: 0,
      isActive: true,
      isDeleted: false
    };
  }

  // ---------- LOADERS ----------

  loadCompanies(): void {
    this.adminService.getCompanies().subscribe((res: Company[]) => {
      this.companyDropdown = res;
    });
  }

  loadRegions(): void {
    this.adminService.getRegions().subscribe((res: Region[]) => {
      this.regionDropdown = res;
    });
  }

  loadCountries(): void {
    this.adminService.getAllCountries().subscribe((res: Country[]) => {
      this.countryList = res;
    });
  }

  // ---------- CRUD ----------

saveCountry(): void {

  // 🔥 remove audit fields before sending
  const payload = {
    countryId: this.country.countryId,
    countryName: this.country.countryName,
    companyId: Number(this.country.companyId),
    regionId: Number(this.country.regionId),
    isActive: this.country.isActive,
    isDeleted: false
  };

  const req$ = this.isEditMode
    ? this.adminService.updateCountry(payload as any)
    : this.adminService.saveCountry(payload as any);

  req$.subscribe({
    next: () => {
      Swal.fire('Success', 'Country saved successfully', 'success');
      this.resetForm();
      this.loadCountries();
    },
    error: err => {
      console.error(err);
      Swal.fire('Error', 'Backend validation failed', 'error');
    }
  });
}


  deleteCountry(c: Country): void {
    Swal.fire({
      title: `Delete ${c.countryName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.deleteCountry(c.countryId).subscribe(() => {
          this.loadCountries();
        });
      }
    });
  }

  editCountry(c: Country): void {
    this.country = { ...c };
    this.isEditMode = true;
  }

  resetForm(): void {
    this.country = this.emptyCountry();
    this.isEditMode = false;
  }

  // ---------- TABLE ----------

  filteredCountries(): Country[] {
    return this.countryList.filter(c =>
      c.countryName.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.statusFilter === '' || c.isActive === this.statusFilter)
    );
  }

  get pagedCountries(): Country[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCountries().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCountries().length / this.pageSize) || 1;
  }

  goToPage(p: number): void {
    this.currentPage = Math.max(1, Math.min(p, this.totalPages));
  }

  sortTable(col: keyof Country): void {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(col: keyof Country): string {
    if (this.sortColumn !== col) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
}