import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../admin/servies/admin.service';

@Component({
  selector: 'app-early-departures',
  standalone: false,
  templateUrl: './early-departures.component.html',
  styleUrl: './early-departures.component.css'
})
export class EarlyDeparturesComponent {
 filterForm!: FormGroup;
  earlyDepartures: any[] = [];
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
  ) {
    // this.loadEmployees();
  }

  ngOnInit() {
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
    this.loadEmployees();
  }

  loadUser() {
    const user = sessionStorage.getItem('currentUser');
    if (user) this.currentUser = JSON.parse(user);
  }

  initForm() {
    this.filterForm = this.fb.group({
      employeeCode: [''],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required]
    });
  }

//  loadSessionUser() {
//     const user = sessionStorage.getItem('currentUser');
//     if (user) this.currentUser = JSON.parse(user);
//   }

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
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    const { employeeCode, fromDate, toDate } = this.filterForm.value;

    this.loading = true;

    this.adminService.getEarlyDepartures(
      this.currentUser.companyId,
      this.currentUser.regionId,
      fromDate,
      toDate,
       this.currentUser.userId
    ).subscribe({
      next: res => {
        this.earlyDepartures = res;
        this.loading = false;
        this.ngOnInit();
      },
      error: () => this.loading = false
    });
  }
}
