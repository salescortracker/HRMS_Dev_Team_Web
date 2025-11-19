import { Component } from '@angular/core';
import { Location } from '../../../layout/models/location.model';
@Component({
  selector: 'app-location',
  standalone: false,
  templateUrl: './location.component.html',
  styleUrl: './location.component.css'
})
export class LocationComponent {

  location: Location = { BranchCode: '', BranchName: '', IsActive: true };
  locations: Location[] = [];
  isEditMode = false;
  searchText = '';

  // Pagination
  currentPage = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations() {
    this.locations = [
      { LocationID: 1, BranchCode: 'BLR001', BranchName: 'Bangalore HQ', City: 'Bangalore', State: 'Karnataka', Country: 'India', IsActive: true },
      { LocationID: 2, BranchCode: 'CHN002', BranchName: 'Chennai Branch', City: 'Chennai', State: 'Tamil Nadu', Country: 'India', IsActive: true },
      { LocationID: 3, BranchCode: 'HYD003', BranchName: 'Hyderabad Branch', City: 'Hyderabad', State: 'Telangana', Country: 'India', IsActive: false }
    ];
  }

  onSubmit() {
    if (this.isEditMode) {
      const index = this.locations.findIndex(l => l.LocationID === this.location.LocationID);
      if (index !== -1) this.locations[index] = { ...this.location };
    } else {
      const newId = this.locations.length + 1;
      this.locations.push({ LocationID: newId, ...this.location });
    }
    this.resetForm();
  }

  editLocation(loc: Location) {
    this.isEditMode = true;
    this.location = { ...loc };
  }

  deleteLocation(loc: Location) {
    this.locations = this.locations.filter(l => l.LocationID !== loc.LocationID);
  }

  resetForm() {
    this.location = { BranchCode: '', BranchName: '', IsActive: true };
    this.isEditMode = false;
  }

  // Filtering + Pagination
  filteredLocations() {
    return this.locations.filter(l =>
      (l.BranchCode?.toLowerCase().includes(this.searchText.toLowerCase()) ||
       l.BranchName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
       l.City?.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }

  paginatedLocations() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLocations().slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.filteredLocations().length / this.pageSize);
  }

  pagesArray() {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) this.currentPage = page;
  }
}
