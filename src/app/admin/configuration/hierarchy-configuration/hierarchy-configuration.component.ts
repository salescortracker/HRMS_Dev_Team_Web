import { Component } from '@angular/core';
interface Employee {
  id: number;
  name: string;
  role: string;
  managerId?: number;
  department: string;
}
@Component({
  selector: 'app-hierarchy-configuration',
  standalone: false,
  templateUrl: './hierarchy-configuration.component.html',
  styleUrl: './hierarchy-configuration.component.css'
})
export class HierarchyConfigurationComponent {
 employees: Employee[] = [
    { id: 1, name: 'Alice Johnson', role: 'CEO', department: 'Management' },
    { id: 2, name: 'Bob Smith', role: 'HR Manager', managerId: 1, department: 'HR' },
    { id: 3, name: 'Catherine Lee', role: 'Finance Manager', managerId: 1, department: 'Finance' },
    { id: 4, name: 'David Kumar', role: 'Software Lead', managerId: 1, department: 'IT' },
    { id: 5, name: 'Eva Brown', role: 'HR Executive', managerId: 2, department: 'HR' },
    { id: 6, name: 'Frank Wilson', role: 'Software Developer', managerId: 4, department: 'IT' },
    { id: 7, name: 'Grace Patel', role: 'Finance Analyst', managerId: 3, department: 'Finance' }
  ];

  newEmployee: Employee = { id: 0, name: '', role: '', managerId: undefined, department: '' };
  isEditMode: boolean = false;

  saveEmployee() {
    if (this.isEditMode) {
      const index = this.employees.findIndex(e => e.id === this.newEmployee.id);
      if (index !== -1) this.employees[index] = { ...this.newEmployee };
    } else {
      this.newEmployee.id = this.employees.length + 1;
      this.employees.push({ ...this.newEmployee });
    }
    this.resetForm();
  }

  editEmployee(emp: Employee) {
    this.newEmployee = { ...emp };
    this.isEditMode = true;
  }

  deleteEmployee(emp: Employee) {
    this.employees = this.employees.filter(e => e.id !== emp.id);
  }

  resetForm() {
    this.newEmployee = { id: 0, name: '', role: '', managerId: undefined, department: '' };
    this.isEditMode = false;
  }
  getManagerName(managerId?: number): string {
  if (managerId === undefined || managerId === null) {
    return '-';
  }
  const manager = this.employees.find(m => m.id === managerId);
  return manager ? manager.name : '-';
}

}
