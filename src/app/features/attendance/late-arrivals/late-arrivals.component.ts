import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../admin/servies/admin.service';

@Component({
  selector: 'app-late-arrivals',
  standalone: false,
  templateUrl: './late-arrivals.component.html',
  styleUrl: './late-arrivals.component.css'
})
export class LateArrivalsComponent {
filterForm!: FormGroup;
  lateArrivals: any[] = [];
  loading = false;
employees:any;
  currentUser: any;

  userId!: number;
  email!: string;
  fullName!: string;
  roleId!: number;
  roleName!: string;
  companyId!: number;
  companyName!: string;
  regionId!: number;
  regionName!: string;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    const userData = sessionStorage.getItem('currentUser');

    if (userData) {
      const user = JSON.parse(userData);

      this.userId = user.userId;
      this.email = user.email;
      this.fullName = user.fullName;
      this.roleId = user.roleId;
      this.roleName = user.roleName;
      this.companyId = user.companyId;
      this.companyName = user.companyName;
      this.regionId = user.regionId;
      this.regionName = user.regionName;
    }
    this.loadEmployees();
    this.loadUser();
    this.initForm();
  }

  
  loadUser() {
    const user = sessionStorage.getItem('currentUser');
    if (user) {
      this.currentUser = JSON.parse(user);
    }
  }

  initForm() {
    this.filterForm = this.fb.group({
      employeeCode: [''],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required]
    });
  }

   loadEmployees(): void {
    this.adminService
      .getEmployees(this.companyId, this.regionId)
      .subscribe({
        next: (res) => {
          this.employees = res;
        },
        error: () => {
          alert('Failed to load employees');
        }
      });
   }

  onFilter() {
    debugger
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }
    // this.filterForm.employeeCode:
    const { employeeCode, fromDate, toDate } = this.filterForm.value;

    this.loading = true;

    this.adminService.getLateArrivals(
      this.currentUser.companyId,
      this.currentUser.regionId,
      fromDate,
      toDate,
      this.currentUser.userId
    ).subscribe({
      next: res => {
        this.lateArrivals = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
