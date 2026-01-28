import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AdminService, Company, Region, State, Country } from '../../servies/admin.service';

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  standalone: false,
  styleUrls: ['./state.component.css']
})
export class StateComponent implements OnInit {

  state: State = this.emptyState();
  stateList: State[] = [];

  countries: Country[] = [];
  companyDropdown: Company[] = [];
  regionDropdown: Region[] = [];

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';

  currentPage = 1;
  pageSize = 5;

  sortColumn: keyof State = 'stateName';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCountries();
    this.loadCompanies();
    this.loadRegions();
    this.loadStates();
  }

  emptyState(): State {
    return {
      stateId: 0,
      countryId: 0,
      stateName: '',
      companyId: 0,
      regionId: 0,
      isActive: true,
      isDeleted: false
    };
  }

  // ---------- LOADERS ----------
  loadCountries(): void {
    this.adminService.getAllCountries().subscribe(res => {
      this.countries = res.filter(c => c.isActive);
    });
  }

  loadCompanies(): void {
    this.adminService.getCompanies().subscribe(res => this.companyDropdown = res);
  }

  loadRegions(): void {
    this.adminService.getRegions().subscribe(res => this.regionDropdown = res);
  }

  loadStates(): void {
    this.adminService.getAllStates().subscribe(res => {
      // map countryName for display in table
      this.stateList = res.map(s => ({
        ...s,
        countryName: this.countries.find(c => c.countryId === s.countryId)?.countryName
      }));
    });
  }

  // ---------- CRUD ----------
  saveState(): void {
    const payload = {
      stateId: this.state.stateId,
      stateName: this.state.stateName,
      countryId: Number(this.state.countryId),
      companyId: Number(this.state.companyId),
      regionId: Number(this.state.regionId),
      isActive: this.state.isActive,
      isDeleted: false
    };

    const req$ = this.isEditMode
      ? this.adminService.updateState(payload as any)
      : this.adminService.saveState(payload as any);

    req$.subscribe({
      next: () => {
        Swal.fire('Success', 'State saved successfully', 'success');
        this.resetForm();
        this.loadStates();
      },
      error: err => {
        console.error(err);
        Swal.fire('Error', 'Backend validation failed', 'error');
      }
    });
  }

  deleteState(s: State): void {
    Swal.fire({
      title: `Delete ${s.stateName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.deleteState(s.stateId).subscribe(() => this.loadStates());
      }
    });
  }

  editState(s: State): void {
    this.state = { ...s };
    this.isEditMode = true;
  }

  resetForm(): void {
    this.state = this.emptyState();
    this.isEditMode = false;
  }

  // ---------- TABLE ----------
  filteredStates(): State[] {
    return this.stateList.filter(s =>
      s.stateName.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.statusFilter === '' || s.isActive === this.statusFilter)
    );
  }

  get pagedStates(): State[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredStates().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredStates().length / this.pageSize) || 1;
  }

  goToPage(p: number): void {
    this.currentPage = Math.max(1, Math.min(p, this.totalPages));
  }

  sortTable(col: keyof State): void {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(col: keyof State): string {
    if (this.sortColumn !== col) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
}

