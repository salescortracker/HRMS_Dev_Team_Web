import { Component } from '@angular/core';
interface Employee {
  employeeId: number;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  email: string;
  mobile: string;
  address: string;
  department: string;
  designation: string;
  joiningDate: string;
  isActive: boolean;
  basicSalary: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  role: string;
  accessModules: string[];
  username: string;
  password: string;
}
@Component({
  selector: 'app-employee',
  standalone: false,
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})
export class EmployeeComponent {
employees: Employee[] = [];
  employee: Employee = this.getEmptyEmployee();

  departments: string[] = ['HR', 'Finance', 'IT', 'Operations', 'Admin'];
  roles: string[] = ['Admin', 'HR', 'Manager', 'Employee'];
  availableModules: string[] = [
    'Dashboard', 'Leaves', 'Payroll', 'Timesheet', 'Recruitment', 'Employee', 'Reports'
  ];

  showForm = false;
  isEdit = false;
  searchText = '';
  p = 1; // pagination page

  ngOnInit(): void {
    this.loadMockEmployees();
  }

  // Load some mock data for demo
  loadMockEmployees() {
    this.employees = [
      {
        employeeId: 101,
        firstName: 'Amit',
        lastName: 'Kumar',
        gender: 'Male',
        dob: '1990-05-15',
        email: 'amit.kumar@company.com',
        mobile: '9876543210',
        address: 'Delhi, India',
        department: 'IT',
        designation: 'Software Engineer',
        joiningDate: '2021-01-12',
        isActive: true,
        basicSalary: 65000,
        bankName: 'HDFC Bank',
        accountNumber: '123456789012',
        ifscCode: 'HDFC0000123',
        role: 'Employee',
        accessModules: ['Dashboard', 'Timesheet', 'Leaves'],
        username: 'amit.kumar',
        password: 'Hrms@123'
      },
      {
        employeeId: 102,
        firstName: 'Priya',
        lastName: 'Sharma',
        gender: 'Female',
        dob: '1992-09-10',
        email: 'priya.sharma@company.com',
        mobile: '9988776655',
        address: 'Mumbai, India',
        department: 'Finance',
        designation: 'Accountant',
        joiningDate: '2020-07-15',
        isActive: true,
        basicSalary: 55000,
        bankName: 'SBI',
        accountNumber: '987654321012',
        ifscCode: 'SBIN0000456',
        role: 'HR',
        accessModules: ['Dashboard', 'Payroll', 'Reports'],
        username: 'priya.sharma',
        password: 'Hrms@123'
      }
    ];
  }

  // Get empty employee template
  getEmptyEmployee(): Employee {
    return {
      employeeId: 0,
      firstName: '',
      lastName: '',
      gender: '',
      dob: '',
      email: '',
      mobile: '',
      address: '',
      department: '',
      designation: '',
      joiningDate: '',
      isActive: true,
      basicSalary: 0,
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      role: '',
      accessModules: [],
      username: '',
      password: ''
    };
  }

  // Open Add Form
  openEmployeeForm() {
    this.employee = this.getEmptyEmployee();
    this.employee.employeeId = this.generateNextId();
    this.showForm = true;
    this.isEdit = false;
  }

  // Generate next employee ID
  generateNextId(): number {
    const maxId = this.employees.length > 0
      ? Math.max(...this.employees.map(e => e.employeeId))
      : 100;
    return maxId + 1;
  }

  // Auto-generate username and password
  generateLoginCredentials() {
    if (this.employee.firstName && this.employee.lastName) {
      this.employee.username = `${this.employee.firstName.toLowerCase()}.${this.employee.lastName.toLowerCase()}`;
    }
    this.employee.password = this.generateAutoPassword();
  }

  // Auto password generator
  generateAutoPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }

  // Save Employee
  saveEmployee() {
    this.generateLoginCredentials();

    if (this.isEdit) {
      const index = this.employees.findIndex(e => e.employeeId === this.employee.employeeId);
      if (index !== -1) {
        this.employees[index] = { ...this.employee };
        alert('Employee updated successfully!');
      }
    } else {
      this.employees.push({ ...this.employee });
      alert(`Employee added successfully!\nLogin Username: ${this.employee.username}\nPassword: ${this.employee.password}`);
    }

    this.cancelForm();
  }

  // Edit Employee
  editEmployee(emp: Employee) {
    this.employee = { ...emp };
    this.showForm = true;
    this.isEdit = true;
  }

  // View Employee
  viewEmployee(emp: Employee) {
    alert(`
      Employee: ${emp.firstName} ${emp.lastName}
      Department: ${emp.department}
      Role: ${emp.role}
      Access: ${emp.accessModules.join(', ')}
    `);
  }

  // Delete Employee
  deleteEmployee(id: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employees = this.employees.filter(e => e.employeeId !== id);
    }
  }

  // Cancel and go back to list
  cancelForm() {
    this.showForm = false;
    this.isEdit = false;
  }
  onAccessChange(module: string, event: any) {
  if (event.target.checked) {
    this.employee.accessModules.push(module);
  } else {
    this.employee.accessModules = this.employee.accessModules.filter(m => m !== module);
  }
}
}
