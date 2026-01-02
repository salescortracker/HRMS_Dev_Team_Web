import { Component ,Input} from '@angular/core';
import { CompanyPolicy } from '../../../admin/layout/models/company-policies.model';
import { environment } from '../../../../environments/environment';
import { AdminService, CategoryDropdown } from '../../../admin/servies/admin.service';
interface Policy {
  Title: string;
  Category: string;
  EffectiveDate: Date;
  Description?: string;
  FileName?: string;
  FileUrl?: string;
}
@Component({
  selector: 'app-employee-policy',
  standalone: false,
  templateUrl: './employee-policy.component.html',
  styleUrl: './employee-policy.component.css'
})
export class EmployeePolicyComponent {
policies: CompanyPolicy[] = []; // load from API
  
 categories: CategoryDropdown[] = [];
  selectedCategory = '';
  fromDate?: string;
  toDate?: string;

  constructor(private adminService: AdminService) {}
  ngOnInit() {
   this.loadPolicies();
     this.loadCategories();
  }

  loadPolicies(): void {
    this.adminService.getAllCompanyPolicies().subscribe({
      next: (res) => {
        this.policies = res;
      },
      error: (err) => {
        console.error('Failed to load policies', err);
      }
    });
  }

  
 loadCategories(): void {
    this.adminService.getActiveCategories().subscribe({
      next: (res) => {
        this.categories = res;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
      }
    });
  }
  applyFilter() {}

  filteredPolicies(): CompanyPolicy[] {
    return this.policies.filter(p => {
      const matchCategory =
        this.selectedCategory ? p.categoryName === this.selectedCategory : true;

      const matchFrom =
        this.fromDate ? new Date(p.effectiveDate) >= new Date(this.fromDate) : true;

      const matchTo =
        this.toDate ? new Date(p.effectiveDate) <= new Date(this.toDate) : true;

      return matchCategory && matchFrom && matchTo;
    });
  }

  viewDocument(path?: string) {
    if (!path) return;
    window.open(`${environment.baseurl}/${path}`, '_blank');
  }
}
