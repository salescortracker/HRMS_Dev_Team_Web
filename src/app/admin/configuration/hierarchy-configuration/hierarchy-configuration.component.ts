
  // // import { Component, OnInit } from '@angular/core';
  // // import { AdminService, ManagerDropdown, EmployeeMaster } from '../../servies/admin.service';

  // // export interface RoleDropdown {
  // //   roleId: number;
  // //   roleName: string;
  // // }

  // // @Component({
  // //   selector: 'app-hierarchy-configuration',
  // //   templateUrl: './hierarchy-configuration.component.html',
  // //   standalone: false,
  // //   styleUrls: ['./hierarchy-configuration.component.css']
  // // })
  // // export class HierarchyConfigurationComponent implements OnInit {

  // //   employees: EmployeeMaster[] = [];
  // //   managers: ManagerDropdown[] = [];

  // //   newEmployee: EmployeeMaster = { 
  // //     employeeMasterId: 0,
  // //     fullName: '',
  // //     role: '',       // <-- now a string
  // //     department: '',
  // //     managerId: undefined
  // //   };

  // //   isEditMode = false;

  // //   userId: number = Number(sessionStorage.getItem('UserId')) || 0;

  // //   constructor(private service: AdminService) {}

  // //   ngOnInit(): void {
  // //     this.loadEmployees();
  // //     this.loadManagers();
  // //   }

  // //   // ================= LOAD DATA =================
  // //   loadEmployees(): void {
  // //     this.service.getAllEmployees().subscribe({
  // //       next: data => this.employees = data,
  // //       error: err => console.error('Error loading employees', err)
  // //     });
  // //   }

  // //   loadManagers(): void {
  // //     this.service.getManagers().subscribe({
  // //       next: data => this.managers = data,
  // //       error: err => console.error('Error loading managers', err)
  // //     });
  // //   }

  // //   // ================= CRUD =================
  // //  saveEmployee(): void {
  // //   // Ensure we have a valid logged-in user
  // //   const userId = Number(sessionStorage.getItem('UserId'));
  // //   if (!userId || userId <= 0) {
  // //     alert('Cannot save employee: invalid logged-in user.');
  // //     return;
  // //   }

  // //   if (this.isEditMode) {
  // //     // EDIT mode → set updatedBy
  // //     const payload: EmployeeMaster = {
  // //       ...this.newEmployee,
  // //       createdBy: undefined, // don't overwrite createdBy
  // //       updatedBy: userId      // must be valid
  // //     };

  // //     this.service.updateEmployee(this.newEmployee.employeeMasterId, payload).subscribe({
  // //       next: () => {
  // //         this.loadEmployees();
  // //         this.resetForm();
  // //       },
  // //       error: err => console.error('Error updating employee', err)
  // //     });

  // //   } else {
  // //     // CREATE mode → set createdBy
  // //     const payload: EmployeeMaster = {
  // //       ...this.newEmployee,
  // //       createdBy: userId,
  // //       updatedBy: undefined
  // //     };

  // //     this.service.createEmployee(payload).subscribe({
  // //       next: () => {
  // //         this.loadEmployees();
  // //         this.resetForm();
  // //       },
  // //       error: err => console.error('Error creating employee', err)
  // //     });
  // //   }
  // // }


  // //   editEmployee(emp: EmployeeMaster): void {
  // //     this.newEmployee = { ...emp };
  // //     this.isEditMode = true;
  // //   }

  // //   deleteEmployee(emp: EmployeeMaster): void {
  // //     if (confirm('Are you sure you want to delete this employee?')) {
  // //       this.service.deleteEmployee(emp.employeeMasterId).subscribe({
  // //         next: () => this.loadEmployees(),
  // //         error: err => console.error('Error deleting employee', err)
  // //       });
  // //     }
  // //   }

  // // resetForm(): void {
  // //   this.newEmployee = { 
  // //     employeeMasterId: 0,
  // //     fullName: '',
  // //     role: '',
  // //     department: '',
  // //     managerId: undefined,
  // //     createdBy: undefined,
  // //     updatedBy: undefined
  // //   };
  // //   this.isEditMode = false;
  // // }

  // //   getManagerName(managerId?: number): string {
  // //     if (!managerId) return '-';
  // //     const manager = this.managers.find(m => m.userId === managerId);
  // //     return manager ? manager.fullName : '-';
  // //   }

  // // }


  // import { Component, OnInit } from '@angular/core';
  // import { AdminService, ManagerDropdown, EmployeeMaster } from '../../servies/admin.service';
  // import Swal from 'sweetalert2'; // <-- SweetAlert2 import

  // @Component({
  //   selector: 'app-hierarchy-configuration',
  //   templateUrl: './hierarchy-configuration.component.html',
  //   standalone: false,
  //   styleUrls: ['./hierarchy-configuration.component.css']
  // })
  // export class HierarchyConfigurationComponent implements OnInit {

  //   employees: EmployeeMaster[] = [];
  //   managers: ManagerDropdown[] = [];

  //   newEmployee: EmployeeMaster = { 
  //     employeeMasterId: 0,
  //     fullName: '',
  //     role: '',      
  //     department: '',
  //     managerId: undefined,
  //     createdBy: undefined,
  //     updatedBy: undefined
  //   };

  //   isEditMode = false;

  //   userId: number = Number(sessionStorage.getItem('UserId')) || 0;
  //   companyId: number = Number(sessionStorage.getItem('CompanyId')) || 0;
  //   regionId: number = Number(sessionStorage.getItem('RegionId')) || 0;

  //   constructor(private service: AdminService) {}

  //   ngOnInit(): void {
  //     if (!this.userId || !this.companyId || !this.regionId) {
  //       Swal.fire({
  //         icon: 'warning',
  //         title: 'Session missing!',
  //         text: 'User session missing. Setting dev defaults...',
  //         timer: 2500,
  //         showConfirmButton: false
  //       });
  //       sessionStorage.setItem('UserId', '1008');
  //       sessionStorage.setItem('CompanyId', '1023');
  //       sessionStorage.setItem('RegionId', '11');
  //       sessionStorage.setItem('roleId', '1'); 
  //       this.userId = 1008;
  //       this.companyId = 1023;
  //       this.regionId = 11;
  //     }

  //     this.loadEmployees();
  //     this.loadManagers();
  //   }

  //   // ================= LOAD DATA =================
  //   loadEmployees(): void {
  //     this.service.getAllEmployees().subscribe({
  //       next: data => this.employees = data,
  //       error: err => Swal.fire({
  //         icon: 'error',
  //         title: 'Error!',
  //         text: 'Failed to load employees.'
  //       })
  //     });
  //   }

  //   loadManagers(): void {
  //     this.service.getManagers().subscribe({
  //       next: data => this.managers = data,
  //       error: err => Swal.fire({
  //         icon: 'error',
  //         title: 'Error!',
  //         text: 'Failed to load managers.'
  //       })
  //     });
  //   }

  //   // ================= CRUD =================
  //   saveEmployee(): void {
  //     if (!this.userId || this.userId <= 0) {
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Invalid User',
  //         text: 'Cannot save employee: invalid logged-in user.'
  //       });
  //       return;
  //     }

  //     if (this.isEditMode) {
  //       const payload: EmployeeMaster = {
  //         ...this.newEmployee,
  //         createdBy: undefined,
  //         updatedBy: this.userId
  //       };

  //       this.service.updateEmployee(this.newEmployee.employeeMasterId, payload).subscribe({
  //         next: () => {
  //           Swal.fire({
  //             icon: 'success',
  //             title: 'Updated!',
  //             text: 'Employee updated successfully.',
  //             timer: 2000,
  //             showConfirmButton: false
  //           });
  //           this.loadEmployees();
  //           this.resetForm();
  //         },
  //         error: err => Swal.fire({
  //           icon: 'error',
  //           title: 'Error!',
  //           text: 'Failed to update employee.'
  //         })
  //       });

  //     } else {
  //       const payload: EmployeeMaster = {
  //         ...this.newEmployee,
  //         createdBy: this.userId,
  //         updatedBy: undefined
  //       };

  //       this.service.createEmployee(payload).subscribe({
  //         next: () => {
  //           Swal.fire({
  //             icon: 'success',
  //             title: 'Added!',
  //             text: 'Employee added successfully.',
  //             timer: 2000,
  //             showConfirmButton: false
  //           });
  //           this.loadEmployees();
  //           this.resetForm();
  //         },
  //         error: err => Swal.fire({
  //           icon: 'error',
  //           title: 'Error!',
  //           text: 'Failed to create employee.'
  //         })
  //       });
  //     }
  //   }

  //   editEmployee(emp: EmployeeMaster): void {
  //     this.newEmployee = { ...emp };
  //     this.isEditMode = true;
  //   }

  //   deleteEmployee(emp: EmployeeMaster): void {
  //     Swal.fire({
  //       title: 'Are you sure?',
  //       text: `Do you want to delete employee ${emp.fullName}?`,
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonText: 'Yes, delete it!',
  //       cancelButtonText: 'Cancel'
  //     }).then(result => {
  //       if (result.isConfirmed) {
  //         this.service.deleteEmployee(emp.employeeMasterId).subscribe({
  //           next: () => {
  //             Swal.fire({
  //               icon: 'success',
  //               title: 'Deleted!',
  //               text: 'Employee deleted successfully.',
  //               timer: 2000,
  //               showConfirmButton: false
  //             });
  //             this.loadEmployees();
  //           },
  //           error: err => Swal.fire({
  //             icon: 'error',
  //             title: 'Error!',
  //             text: 'Failed to delete employee.'
  //           })
  //         });
  //       }
  //     });
  //   }

  //   resetForm(): void {
  //     this.newEmployee = { 
  //       employeeMasterId: 0,
  //       fullName: '',
  //       role: '',
  //       department: '',
  //       managerId: undefined,
  //       createdBy: undefined,
  //       updatedBy: undefined
  //     };
  //     this.isEditMode = false;
  //   }

  //   getManagerName(managerId?: number): string {
  //     if (!managerId) return '-';
  //     const manager = this.managers.find(m => m.userId === managerId);
  //     return manager ? manager.fullName : '-';
  //   }
  // }



  import { Component, OnInit } from '@angular/core';
import { AdminService, ManagerDropdown, EmployeeMaster } from '../../servies/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-hierarchy-configuration',
  templateUrl: './hierarchy-configuration.component.html',
  standalone: false,
  styleUrls: ['./hierarchy-configuration.component.css']
})
export class HierarchyConfigurationComponent implements OnInit {

  employees: EmployeeMaster[] = [];
  managers: ManagerDropdown[] = [];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  paginatedEmployees: EmployeeMaster[] = [];

  newEmployee: EmployeeMaster = { 
    employeeMasterId: 0,
    fullName: '',
    role: '',      
    department: '',
    managerId: undefined,
    createdBy: undefined,
    updatedBy: undefined
  };

  isEditMode = false;

  userId: number = Number(sessionStorage.getItem('UserId')) || 0;
  companyId: number = Number(sessionStorage.getItem('CompanyId')) || 0;
  regionId: number = Number(sessionStorage.getItem('RegionId')) || 0;

  constructor(private service: AdminService) {}

  ngOnInit(): void {
    if (!this.userId || !this.companyId || !this.regionId) {
      Swal.fire({
        icon: 'warning',
        title: 'Session missing!',
        text: 'User session missing. Setting dev defaults...',
        timer: 2500,
        showConfirmButton: false
      });
      sessionStorage.setItem('UserId', '1008');
      sessionStorage.setItem('CompanyId', '1023');
      sessionStorage.setItem('RegionId', '11');
      sessionStorage.setItem('roleId', '1'); 
      this.userId = 1008;
      this.companyId = 1023;
      this.regionId = 11;
    }

    this.loadEmployees();
    this.loadManagers();
  }

  // ================= LOAD DATA =================
  loadEmployees(): void {
    this.service.getAllEmployees().subscribe({
      next: data => {
        this.employees = data;
        this.totalPages = Math.ceil(this.employees.length / this.pageSize);
        this.setPaginatedEmployees();
      },
      error: err => Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load employees.'
      })
    });
  }

  setPaginatedEmployees(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEmployees = this.employees.slice(startIndex, endIndex);
  }

  loadManagers(): void {
    this.service.getManagers().subscribe({
      next: data => this.managers = data,
      error: err => Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load managers.'
      })
    });
  }

  // ================= CRUD =================
  saveEmployee(): void {
    if (!this.userId || this.userId <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid User',
        text: 'Cannot save employee: invalid logged-in user.'
      });
      return;
    }

    if (this.isEditMode) {
      const payload: EmployeeMaster = {
        ...this.newEmployee,
        createdBy: undefined,
        updatedBy: this.userId
      };

      this.service.updateEmployee(this.newEmployee.employeeMasterId, payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Employee updated successfully.',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadEmployees();
          this.resetForm();
        },
        error: err => Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to update employee.'
        })
      });

    } else {
      const payload: EmployeeMaster = {
        ...this.newEmployee,
        createdBy: this.userId,
        updatedBy: undefined
      };

      this.service.createEmployee(payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Added!',
            text: 'Employee added successfully.',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadEmployees();
          this.resetForm();
        },
        error: err => Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to create employee.'
        })
      });
    }
  }

  editEmployee(emp: EmployeeMaster): void {
    this.newEmployee = { ...emp };
    this.isEditMode = true;
  }

  deleteEmployee(emp: EmployeeMaster): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete employee ${emp.fullName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.deleteEmployee(emp.employeeMasterId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Employee deleted successfully.',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadEmployees();
          },
          error: err => Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to delete employee.'
          })
        });
      }
    });
  }

  resetForm(): void {
    this.newEmployee = { 
      employeeMasterId: 0,
      fullName: '',
      role: '',
      department: '',
      managerId: undefined,
      createdBy: undefined,
      updatedBy: undefined
    };
    this.isEditMode = false;
  }

  getManagerName(managerId?: number): string {
    if (!managerId) return '-';
    const manager = this.managers.find(m => m.userId === managerId);
    return manager ? manager.fullName : '-';
  }

  // ================= PAGINATION =================
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.setPaginatedEmployees();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.setPaginatedEmployees();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.setPaginatedEmployees();
    }
  }

}
