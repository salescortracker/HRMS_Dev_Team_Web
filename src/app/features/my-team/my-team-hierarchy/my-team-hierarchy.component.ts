import { Component,Input } from '@angular/core';
interface Employee {
  id: number;
  name: string;
  role: string;
  managerId?: number;
}
@Component({
  selector: 'app-my-team-hierarchy',
  standalone: false,
  templateUrl: './my-team-hierarchy.component.html',
  styleUrl: './my-team-hierarchy.component.css'
})
export class MyTeamHierarchyComponent {
  employees: Employee[] = [
    { id: 1, name: 'John Smith', role: 'CEO' },
    { id: 2, name: 'Alice Johnson', role: 'HR Manager', managerId: 1 },
    { id: 3, name: 'Bob Lee', role: 'IT Manager', managerId: 1 },
    { id: 4, name: 'Clara Doe', role: 'HR Executive', managerId: 2 },
    { id: 5, name: 'David Kim', role: 'Lead Developer', managerId: 3 },
    { id: 6, name: 'Eva Wong', role: 'Developer', managerId: 5 },
    { id: 7, name: 'Fiona Adams', role: 'Intern', managerId: 6 },
    { id: 8, name: 'George White', role: 'Developer', managerId: 5 },
    { id: 9, name: 'Helen Brown', role: 'Finance Manager', managerId: 1 },
    { id: 10, name: 'Ian Black', role: 'Finance Executive', managerId: 9 },
  ];

  // Filter top-level employees (CEOs)
  topLevelEmployees(): Employee[] {
    return this.employees.filter(e => !e.managerId);
  }

  getSubordinates(managerId: number): Employee[] {
    return this.employees.filter(e => e.managerId === managerId);
  }
}
