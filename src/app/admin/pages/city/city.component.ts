import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AdminService, City, Company, Region, State, Country } from '../../servies/admin.service';

@Component({
  selector: 'app-city',
  standalone: false,
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit {

  city: City = this.emptyCity();
  cityList: City[] = [];

  companyDropdown: Company[] = [];
  regionDropdown: Region[] = [];
  stateDropdown: State[] = [];
  countryDropdown: Country[] = [];

  filteredStates: State[] = [];

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';

  currentPage = 1;
  pageSize = 5;

  sortColumn: keyof City = 'cityName';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCountries();
    this.loadCompanies();
    this.loadRegions();
    this.loadStates();
    this.loadCities();
  }

  emptyCity(): City {
    return {
      cityId: 0,
      cityName: '',
      countryId: 0,
      companyId: 0,
      regionId: 0,
      stateId: 0,
      isActive: true,
      isDeleted: false
    };
  }

  // ---------- LOADERS ----------
  loadCountries(): void {
    this.adminService.getAllCountries().subscribe(res => this.countryDropdown = res);
  }

  loadStates(): void {
    this.adminService.getAllStates().subscribe(res => {
      this.stateDropdown = res;
      this.filteredStates = [];
    });
  }

  onCountryChange(countryId: number): void {
    this.filteredStates = this.stateDropdown.filter(s => s.countryId === countryId);
    this.city.stateId = 0; // reset state selection
  }

  loadCompanies(): void {
    this.adminService.getCompanies().subscribe(res => this.companyDropdown = res);
  }

  loadRegions(): void {
    this.adminService.getRegions().subscribe(res => this.regionDropdown = res);
  }

  loadCities(): void {
    this.adminService.getAllCities().subscribe(res => this.cityList = res);
  }

  // ---------- CRUD ----------
  saveCity(): void {
    const payload: City = {
      cityId: Number(this.city.cityId ?? 0),
      cityName: this.city.cityName ?? '',
      companyId: Number(this.city.companyId ?? 0),
      regionId: Number(this.city.regionId ?? 0),
      stateId: Number(this.city.stateId ?? 0),
      countryId: Number(this.city.countryId ?? 0),
      isActive: this.city.isActive ?? true,
      isDeleted: false
    };

    const req$ = this.isEditMode
      ? this.adminService.updateCity(payload)
      : this.adminService.saveCity(payload);

    req$.subscribe({
      next: () => {
        Swal.fire('Success', 'City saved successfully', 'success');
        this.resetForm();
        this.loadCities();
      },
      error: err => {
        console.error(err);
        Swal.fire('Error', 'Backend validation failed', 'error');
      }
    });
  }

  deleteCity(c: City): void {
    Swal.fire({
      title: `Delete ${c.cityName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.deleteCity(c.cityId).subscribe(() => this.loadCities());
      }
    });
  }

  editCity(c: City): void {
    this.city = { ...c };
    this.isEditMode = true;

    // ✅ Set country based on stateId
    const state = this.stateDropdown.find(s => s.stateId === c.stateId);
    if (state) {
      this.city.countryId = state.countryId;
      this.onCountryChange(this.city.countryId); // filter states
    } else {
      this.filteredStates = [];
    }
  }

  resetForm(): void {
    this.city = this.emptyCity();
    this.isEditMode = false;
    this.filteredStates = [];
  }

  // ---------- TABLE ----------
  filteredCities(): City[] {
    return this.cityList.filter(c =>
      c.cityName.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.statusFilter === '' || c.isActive === this.statusFilter)
    );
  }

  get pagedCities(): City[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCities().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCities().length / this.pageSize) || 1;
  }

  goToPage(p: number): void {
    this.currentPage = Math.max(1, Math.min(p, this.totalPages));
  }

  sortTable(col: keyof City): void {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(col: keyof City): string {
    if (this.sortColumn !== col) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // ---------- GET NAMES FOR TABLE ----------
  getCountryName(stateId: number): string {
    const state = this.stateDropdown.find(s => s.stateId === stateId);
    if (!state) return '';
    const country = this.countryDropdown.find(c => c.countryId === state.countryId);
    return country ? country.countryName : '';
  }

  getStateName(stateId: number): string {
    const state = this.stateDropdown.find(s => s.stateId === stateId);
    return state ? state.stateName : '';
  }

  getRegionName(regionId: number): string {
    const region = this.regionDropdown.find(r => r.regionID === regionId);
    return region ? region.regionName : '';
  }

  getCompanyName(companyId: number): string {
    const company = this.companyDropdown.find(c => c.companyId === companyId);
    return company ? company.companyName : '';
  }

}
