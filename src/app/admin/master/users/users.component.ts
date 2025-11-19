import { Component } from '@angular/core';
import { AdminService, User, Company, Region, RoleMaster } from '../../servies/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
   users: User[] = [];
  companies: Company[] = [];
  regions: Region[] = [];
  roles: RoleMaster[] = [];
  user: User = this.getEmptyUser();
  isEditMode = false;

  constructor(private userService: AdminService) {}

  ngOnInit(): void {
    debugger;
    this.generateNextEmployeeCode();
    this.loadUsers();
    this.loadCompanies();
    this.loadRegions();
    this.loadRoles();
  }

  getEmptyUser(): User {
    return {
      UserID: 0,
      companyId: 0,
      regionId: 0,
      employeeCode: '',
      fullName: '',
      email: '',
      roleId: 0,
      password: '',
      status: 'Active'
    };
  }

  onStatusChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.user.status = input?.checked ? 'Active' : 'Inactive';
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => (this.users = res),
      error: () => this.showError('Failed to load users.')
    });
  }

  loadCompanies(): void {
    this.userService.getCompanies().subscribe({
      next: (res: any) => {

this.companies = res;
this.generateNextEmployeeCode();
      },
      error: () => this.showError('Failed to load companies.')
    });
  }

  loadRegions(): void {
    this.userService.getRegions().subscribe({
      next: (res: any) => (this.regions = res),
      error: () => this.showError('Failed to load regions.')
    });
  }

  loadRoles(): void {
    this.userService.getroles().subscribe({
      next: (res: any) => (this.roles = res),
      error: () => this.showError('Failed to load roles.')
    });
  }
 // 🔹 Auto-generate Employee Code (Frontend only)
 generateNextEmployeeCode(): void {
  // If no users exist yet
  if (!this.users || this.users.length === 0) {
    this.user.employeeCode = 'EMP0001';
    return;
  }

  // Get all numeric parts from employee codes
  const numericCodes = this.users
    .map(u => {
      const match = u.employeeCode?.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter(num => num > 0);

  // Find max existing number
  const maxCode = Math.max(...numericCodes);

  // Increment by 1
  const nextCode = maxCode + 1;

  // Format and assign
  this.user.employeeCode = `EMP${nextCode.toString().padStart(4, '0')}`;
}

  onSubmit(): void {
    if (this.isEditMode) {
      this.userService.updateUser(this.user.UserID!, this.user).subscribe({
        next: () => {
          this.showSuccess('User updated successfully!');
          this.resetForm();
          this.loadUsers();
        },
        error: () => this.showError('Failed to update user.')
      });
    } else {

      this.userService.createUser(this.user).subscribe({
        next: () => {
          this.showSuccess('User created successfully. Welcome email sent!');
          this.resetForm();
          this.loadUsers();
        },
        error: () => this.showError('Failed to create user.')
      });
    }
  }

  editUser(u: User): void {
    this.user = { ...u };
    this.isEditMode = true;
  }

  deleteUser(u: User): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the user.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.userService.deleteUser(u.UserID!).subscribe({
          next: () => {
            this.showSuccess('User deleted successfully.');
            this.loadUsers();
          },
          error: () => this.showError('Failed to delete user.')
        });
      }
    });
  }

  sendPasswordEmail(u: User): void {
    this.userService.sendWelcomeEmail(u).subscribe({
      next: () => this.showSuccess('Welcome email sent successfully!'),
      error: () => this.showError('Failed to send email.')
    });
  }

  generateFormPassword(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#';
    this.user.password = Array.from({ length: 10 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }

  resetForm(): void {
    this.user = this.getEmptyUser();
    this.isEditMode = false;
  }

  getCompanyName(id: number): string {
    return this.companies.find(c => c.companyId === id)?.companyName || '-';
  }

  getRegionName(id: number): string {
    return this.regions.find(r => r.regionID === id)?.regionName || '-';
  }

  getRoleName(id: number): string {
    return this.roles.find(r => r.roleId === id)?.roleName || '-';
  }

  showSuccess(msg: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: msg,
      timer: 2000,
      showConfirmButton: false
    });
  }

  showError(msg: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: msg,
      timer: 2500,
      showConfirmButton: false
    });
  }
}
