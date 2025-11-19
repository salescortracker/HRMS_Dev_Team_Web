import { Component } from '@angular/core';
interface Policy {
  Title: string;
  Category: string;
  EffectiveDate: Date;
  Description?: string;
  FileName?: string;
  FileUrl?: string;
}
@Component({
  selector: 'app-company-policies',
  standalone: false,
  templateUrl: './company-policies.component.html',
  styleUrl: './company-policies.component.css'
})
export class CompanyPoliciesComponent {
categories: string[] = ['HR Policy', 'Compliance', 'IT Security', 'Finance', 'General'];
  policies: Policy[] = [];
  policy: Policy = this.resetPolicy();
  isEditMode: boolean = false;
  editIndex: number | null = null;

  resetPolicy(): Policy {
    return { Title: '', Category: '', EffectiveDate: new Date(), Description: '' };
  }

  onSubmit() {
    if (this.isEditMode && this.editIndex !== null) {
      this.policies[this.editIndex] = { ...this.policy };
    } else {
      this.policies.push({ ...this.policy });
    }
    this.resetForm();
  }

  editPolicy(p: Policy) {
    this.isEditMode = true;
    this.editIndex = this.policies.indexOf(p);
    this.policy = { ...p };
  }

  deletePolicy(p: Policy) {
    const idx = this.policies.indexOf(p);
    if (idx > -1) this.policies.splice(idx, 1);
  }

  resetForm() {
    this.policy = this.resetPolicy();
    this.isEditMode = false;
    this.editIndex = null;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.policy.FileName = file.name;
      this.policy.FileUrl = URL.createObjectURL(file);
    }
  }
}
