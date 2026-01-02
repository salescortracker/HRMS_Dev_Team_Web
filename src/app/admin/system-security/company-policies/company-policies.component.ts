import { Component } from '@angular/core';
import { AdminService, CategoryDropdown } from '../../servies/admin.service';
import { CompanyPolicy } from '../../layout/models/company-policies.model';
import { environment } from '../../../../environments/environment';





@Component({
  selector: 'app-company-policies',
  standalone: false,
  templateUrl: './company-policies.component.html',
  styleUrl: './company-policies.component.css'
})
export class CompanyPoliciesComponent {

 categories: CategoryDropdown[] = [];
  policies: CompanyPolicy[] = [];

  policy: any = this.resetPolicy();
  isEditMode = false;

  companyId!: number;
  regionId!: number;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.companyId = Number(sessionStorage.getItem('CompanyId'));
    this.regionId = Number(sessionStorage.getItem('RegionId'));

    this.loadCategories();
    this.loadPolicies();
  }

  // ---------------- LOADERS ----------------

  loadCategories() {
    this.adminService.getActiveCategories().subscribe(res => {
      this.categories = res;
    });
  }

  loadPolicies() {
    this.adminService
      .getCompanyPolicies(this.companyId, this.regionId)
      .subscribe(res => {
        this.policies = res;
      });
  }

  // ---------------- FORM ----------------

  resetPolicy() {
    return {
      policyId: 0,
      Title: '',
      CategoryId: null,
      EffectiveDate: '',
      Description: '',
      File: null
    };
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.policy.File = file;
    }
  }

onSubmit() {

  // 🔴 IMPORTANT: convert to number
  this.policy.CategoryId = Number(this.policy.CategoryId);

  if (!this.policy.CategoryId) {
    alert('Please select a category');
    return;
  }

  const formData = new FormData();

  formData.append('CompanyId', this.companyId.toString());
  formData.append('RegionId', this.regionId.toString());
  formData.append('Title', this.policy.Title);
  formData.append('CategoryId', this.policy.CategoryId.toString());
  formData.append('EffectiveDate', this.policy.EffectiveDate);
  formData.append('Description', this.policy.Description || '');

  if (this.policy.File) {
    formData.append('File', this.policy.File);
  }

  if (this.isEditMode) {
    this.adminService.updateCompanyPolicy(this.policy.policyId, formData)
      .subscribe(() => {
        this.loadPolicies();
        this.resetForm();
      });
  } else {
    this.adminService.createCompanyPolicy(formData)
      .subscribe(() => {
        this.loadPolicies();
        this.resetForm();
      });
  }
}


  editPolicy(p: CompanyPolicy) {
    this.isEditMode = true;
    this.policy = {
      policyId: p.policyId,
      Title: p.title,
      CategoryId: p.categoryId,
      EffectiveDate: p.effectiveDate,
      Description: p.description
    };
  }

  deletePolicy(p: CompanyPolicy) {
    if (!confirm('Are you sure to delete this policy?')) return;

    this.adminService
      .deleteCompanyPolicy(p.policyId!)
      .subscribe(() => this.loadPolicies());
  }

  resetForm() {
    this.policy = this.resetPolicy();
    this.isEditMode = false;
  }

viewDocument(documentPath?: string, download = false): void {
  if (!documentPath) return;

  const baseUrl = environment.baseurl;

  const cleanPath = documentPath.startsWith('/')
    ? documentPath.substring(1)
    : documentPath;

  const fileUrl = `${baseUrl}/${cleanPath}`;

  if (download) {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = this.getFileName(cleanPath);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    window.open(fileUrl, '_blank');
  }
}

private getFileName(path: string): string {
  return path.split('/').pop() || 'download';
}


}

