import { Component } from '@angular/core';
import { User } from '../../../layout/models/user.model';
@Component({
  selector: 'app-user-management',
  standalone: false,
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent {
user: User = { FullName: '', Email: '', Role: '', Department: '', Password: '', IsActive: true, sendEmailOption: 'auto' };
  users: User[] = [];
  isEditMode = false;
  searchText = '';

  roles: string[] = ['Admin', 'Manager', 'Employee'];
  departments: string[] = ['HR', 'Finance', 'IT', 'Sales'];

  currentPage = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    // Sample data – replace with API call
    this.users = [
      { UserID: 1, FullName: 'John Doe', Email: 'john@example.com', Role: 'Admin', Department: 'HR', IsActive: true, sendEmailOption: 'manual' },
      { UserID: 2, FullName: 'Jane Smith', Email: 'jane@example.com', Role: 'Employee', Department: 'IT', IsActive: true, sendEmailOption: 'auto' }
    ];
  }

  onSubmit() {
    if (this.isEditMode) {
      const index = this.users.findIndex(u => u.UserID === this.user.UserID);
      if (index !== -1) this.users[index] = { ...this.user };
    } else {
      const newId = this.users.length + 1;
      this.users.push({ UserID: newId, ...this.user });
    }

    // Send email automatically if selected
    if (this.user.sendEmailOption === 'auto') {
      this.sendEmail(this.user);
    }

    this.resetForm();
  }

  editUser(u: User) {
    this.isEditMode = true;
    this.user = { ...u };
  }

  deleteUser(u: User) {
    this.users = this.users.filter(x => x.UserID !== u.UserID);
  }

  resetForm() {
    this.user = { FullName: '', Email: '', Role: '', Department: '', Password: '', IsActive: true, sendEmailOption: 'auto' };
    this.isEditMode = false;
  }

  generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
    let pass = '';
    for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    this.user.Password = pass;
  }

  sendEmail(user: User) {
    // Replace with your API or SMTP service integration
    console.log(`Sending credentials to ${user.Email} with password: ${user.Password}`);
    alert(`Credentials sent to ${user.Email} successfully!`);
  }

  // Filtering + Pagination
  filteredUsers() {
    return this.users.filter(u =>
      u.FullName.toLowerCase().includes(this.searchText.toLowerCase()) ||
      u.Email.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  paginatedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.filteredUsers().length / this.pageSize);
  }

  pagesArray() {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) this.currentPage = page;
  }
}
