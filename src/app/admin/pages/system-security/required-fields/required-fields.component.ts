import { Component } from '@angular/core';
import { ModuleField } from '../../../layout/models/required-field.model';
@Component({
  selector: 'app-required-fields',
  standalone: false,
  templateUrl: './required-fields.component.html',
  styleUrl: './required-fields.component.css'
})
export class RequiredFieldsComponent {
 modules: string[] = ['Employee', 'Leave', 'Payroll', 'Attendance'];
  selectedModule: string = '';
  selectedFieldName: string = '';
  selectedFieldRequired: boolean = false;

  moduleFields: ModuleField[] = [];
  addedFields: ModuleField[] = [];

  ngOnInit(): void {}

  loadModuleFields() {
    switch (this.selectedModule) {
      case 'Employee':
        this.moduleFields = [
          { FieldName: 'Full Name', IsRequired: true },
          { FieldName: 'Email', IsRequired: true },
          { FieldName: 'Mobile', IsRequired: false },
          { FieldName: 'Department', IsRequired: true },
          { FieldName: 'Designation', IsRequired: true }
        ];
        break;
      case 'Leave':
        this.moduleFields = [
          { FieldName: 'Leave Type', IsRequired: true },
          { FieldName: 'From Date', IsRequired: true },
          { FieldName: 'To Date', IsRequired: true },
          { FieldName: 'Reason', IsRequired: false }
        ];
        break;
      case 'Payroll':
        this.moduleFields = [
          { FieldName: 'Basic Salary', IsRequired: true },
          { FieldName: 'HRA', IsRequired: true },
          { FieldName: 'Deductions', IsRequired: false }
        ];
        break;
      case 'Attendance':
        this.moduleFields = [
          { FieldName: 'Employee', IsRequired: true },
          { FieldName: 'Date', IsRequired: true },
          { FieldName: 'Status', IsRequired: true }
        ];
        break;
      default:
        this.moduleFields = [];
    }

    this.selectedFieldName = '';
    this.selectedFieldRequired = false;
  }

  addField() {
    if (!this.selectedFieldName) return;

    const exists = this.addedFields.find(f => f.FieldName === this.selectedFieldName);
    if (exists) {
      alert('Field already added.');
      return;
    }

    this.addedFields.push({
      FieldName: this.selectedFieldName,
      IsRequired: this.selectedFieldRequired
    });

    this.selectedFieldName = '';
    this.selectedFieldRequired = false;
  }

  removeField(index: number) {
    this.addedFields.splice(index, 1);
  }

  saveFields() {
    console.log(`Module: ${this.selectedModule}`, this.addedFields);
    alert(`Required fields for ${this.selectedModule} saved successfully!`);
    // Call API to save configuration
  }

  resetAll() {
    this.selectedModule = '';
    this.selectedFieldName = '';
    this.selectedFieldRequired = false;
    this.moduleFields = [];
    this.addedFields = [];
  }
}
