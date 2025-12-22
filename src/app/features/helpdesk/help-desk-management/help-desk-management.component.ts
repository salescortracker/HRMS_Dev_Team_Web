import { Component, OnInit } from '@angular/core';
import { AdminService, ApprovalRow, Department, RaiseTicket,  RaiseTicketApproval,  User } from '../../../admin/servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-help-desk-management',
  standalone: false,
  templateUrl: './help-desk-management.component.html',
  styleUrl: './help-desk-management.component.css'
}) 
export class HelpDeskManagementComponent  implements OnInit{

   companyId!: any;
   regionId!: any;
  employeeId!: any;
  //departmentId!: any;
 



  //Labels
  categoryLabels: Record<number, string> = {
  1: 'IT Support',
  2: 'Payroll',
  3: 'Leave/Attendance',
  4: 'HR Query',
  5: 'Other'
};

priorityLabels: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Critical'
};
  
  employeeName = '';
  departmentName = '';
  employeeDisplay = '';


    //raiseTickets:RaiseTicket[] = [];
   
    // user: User = this.getEmptyUser();
    raiseTicket: RaiseTicket = this.getEmptyraiseTicket();
    raiseTicketList: RaiseTicket[] = [];

     tickets: ApprovalRow[] = [];           // merged approvals + tickets for tab 3
    
    

  isEditMode = false;
  
 

  showUploadPopup = false;


 constructor(private admin: AdminService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    this.companyId = Number(sessionStorage.getItem('CompanyId') ?? currentUser.companyId ?? 0);
    this.regionId = Number(sessionStorage.getItem('RegionId') ?? currentUser.regionId ?? 0);
    this.employeeId = Number(currentUser.userId) ;
    //console.log('Params in getAllRaiseTickets:',currentUser);
    // Access the userId
    console.log('Employee/User ID:', this.employeeId);

    this.loadraiseTicket();
    this.loadApprovalTickets();
    
   }
 
   /** Default new record */
   getEmptyraiseTicket(): RaiseTicket {
     return {
       raiseTicketId: 0,
       companyID: this.companyId,
       regionID: this.regionId,
       employeeID:this.employeeId,
        departmentID: 0,
        categoryId: 0,
        subjectIssue: '',
        status: '',
        description: '',
        priority: 0
       
     };
   }
   /** Load Data */
     loadraiseTicket(): void {
            this.spinner.show();
            this.admin.getAllRaiseTickets(this.companyId, this.regionId, this.employeeId)
            .pipe(finalize(() => this.spinner.hide()))
            .subscribe({
            next: (res: any[]) => {
            this.raiseTicketList = res.map(t => ({
              ...t,
              createdDate: t.createdDate,
              modifiedAt: t.modifiedAt 
            }));
            console.log('Loaded Tickets:', this.raiseTicketList);
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Failed to load tickets.', 'error');
          }
        });
     }
   
     /** Submit Create / Update */
     onSubmit(): void {
  // Base payload
  const baseTicket: RaiseTicket = {
    ...this.raiseTicket,
    companyID: this.companyId,
    regionID: this.regionId
  };

  // Create vs Update payloads
  const createPayload = { ...baseTicket, createdBy: this.employeeId };
  const updatePayload = { ...baseTicket, modifiedBy: this.employeeId };

  this.spinner.show();

  const request$ = this.isEditMode
    ? this.admin.updateRaiseTicket(updatePayload.raiseTicketId, updatePayload)
    : this.admin.createTicket(createPayload);

  request$.pipe(finalize(() => this.spinner.hide())).subscribe({
    next: () => {
      Swal.fire(
        this.isEditMode ? 'Updated' : 'Created',
        `Ticket ${this.isEditMode ? 'updated' : 'created'} successfully!`,
        'success'
      );
      this.loadraiseTicket();   //  reload list
      this.resetForm();         //  clear form
    },
    error: (err) => {
      const action = this.isEditMode ? 'Update' : 'Create';
      const message = err.status === 404
        ? `${action} failed: Ticket not found.`
        : `${action} failed. Please try again.`;
      Swal.fire('Error', message, 'error');
      this.loadraiseTicket();   //  reload anyway to refresh UI
    }
  });
}

   
     /** Edit */
     editTicket(item: RaiseTicket): void {
    this.raiseTicket = { ...item };
    this.isEditMode = true;
  }

   
     /** Delete */
     deleteTicket(item: RaiseTicket): void {
    Swal.fire({
      title: `Delete ticket "${item.subjectIssue}"?`,
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.admin.deleteRaiseTicket(item.raiseTicketId).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted', 'Ticket deleted successfully.', 'success');
            this.loadraiseTicket();

             },
             error: () => {
               this.spinner.hide();
               Swal.fire('Error', 'Delete failed.', 'error');
             }
           });
         }
       });
     }
   
     /** Reset form */
     resetForm(): void {
    this.raiseTicket = this.getEmptyraiseTicket();
    this.isEditMode = false;
  }

   /** File Selection */
    onFileSelected(event: Event): void {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        this.raiseTicket.uploadPicPath = file.name;
        //this.raiseTicket.attachment = file; // keep actual file for upload
      }
    }

   //Filter, Pagination, Sorting
    searchText: string = '';
    selectedCategory: string = '';
    selectedStatus: string = '';
    selectedDate: string = ''; // ISO format from <input type="date">

    // Sorting
      sortColumn: keyof RaiseTicket | null = null;
      sortDirection: 'asc' | 'desc' = 'asc';

    // Pagination
    pageSize = 5;
    currentPage = 1;
    pageSizeOptions = [5,10, 20, 50, 100];

  // -------------------------------------------------------------
  //  Sorting
  // -------------------------------------------------------------
  sortBy(column: keyof RaiseTicket): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  sortTickets(data: RaiseTicket[]): RaiseTicket[] {
  if (!this.sortColumn) return data;

  return data.sort((a, b) => {
    const valA = a[this.sortColumn!] ?? '';
    const valB = b[this.sortColumn!] ?? '';

    if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}

  getSortIcon(column: keyof RaiseTicket): string {
  if (this.sortColumn !== column) return '';
  return this.sortDirection === 'asc' ? '&#9650;' : '&#9660;'; // ▲ ▼
  }


    // Filter RaiseTickets based on search text
    filterTickets(data: RaiseTicket[]): RaiseTicket[] {
      return data.filter(t => {
        const matchCategory = !this.selectedCategory ||
          this.categoryLabels[t.categoryId] === this.selectedCategory;

        const matchStatus = !this.selectedStatus ||
          t.status?.toLowerCase() === this.selectedStatus.toLowerCase();

        const matchDate = !this.selectedDate ||
          (t.createdDate && new Date(t.createdDate).toISOString().slice(0, 10) === this.selectedDate);

        return matchCategory && matchStatus && matchDate;
      });
    }
  


    paginateTickets(data: RaiseTicket[]): RaiseTicket[] {
      const start = (this.currentPage - 1) * this.pageSize;
      return data.slice(start, start + this.pageSize);
    }
    get pagedRaiseTickets(): RaiseTicket[] {
      let data = [...this.raiseTicketList];
      data = this.sortTickets(data);
      data = this.filterTickets(data);
      return this.paginateTickets(data);
    }

    get totalPages(): number {
      const filtered = this.filterTickets(this.sortTickets([...this.raiseTicketList]));
      return Math.ceil(filtered.length / this.pageSize) || 1;
    }  


      changePageSize(event: any): void {
        this.pageSize = +event.target.value;
        this.currentPage = 1;
      }

      goToPage(page: number): void {
        this.currentPage = page;
      }


    
    applyFilters(): void {
      this.currentPage = 1; // reset pagination when filters change
    }
      
    clearFilters(): void {
      this.selectedCategory = '';
      this.selectedStatus = '';
      this.selectedDate = '';
      this.currentPage = 1;
    }

    
   // Approve / Reject (Optional)
    
   selectedIds = new Set<number>();            // approval IDs
  perRowComments = new Map<number, string>(); // approvalId -> comment
  perRowStatuses = new Map<number, string>(); // approvalId -> chosen ticket status (optional)

  loadApprovalTickets(): void {
    this.spinner.show();
    this.admin.getAllRaiseTickets(this.companyId, this.regionId, this.employeeId).subscribe({
      next: (ticketList: RaiseTicket[]) => {
        this.admin.getApprovals().pipe(finalize(() => this.spinner.hide()))
          .subscribe({
            next: (approvalList: RaiseTicketApproval[]) => {
              this.tickets = approvalList.map(a => {
                const t = ticketList.find(tt => tt.raiseTicketId === a.raiseTicketId);
                const priorityLabel =
                  t?.priority === 1 ? this.priorityLabels[1] :
                  t?.priority === 2 ? this.priorityLabels[2] :
                  t?.priority === 3 ? this.priorityLabels[3] :
                  t?.priority === 4 ? this.priorityLabels[4] : '';

                
                  return {
  ...a,
  ...t,
  employeeId: t?.employeeID ?? 0, // map backend field to your interface
  categoryName: t?.categoryId != null ? this.categoryLabels[t.categoryId] : '',
  priorityLabel: t?.priority != null ? this.priorityLabels[t.priority] : ''
} as ApprovalRow;
              });
            },
            error: () => { Swal.fire('Error', 'Failed to load approvals.', 'error'); }
          });
      },
      error: () => { this.spinner.hide(); Swal.fire('Error', 'Failed to load tickets for approvals.', 'error'); }
    });
  }

  toggleOne(approvalId: number, ev: Event): void {
    const checked = (ev.target as HTMLInputElement).checked;
    checked ? this.selectedIds.add(approvalId) : this.selectedIds.delete(approvalId);
  }

  updateComment(id: number, event: Event): void {
  const input = event.target as HTMLTextAreaElement;
  this.perRowComments.set(id, input.value);
}
  updateTicketStatus(id: number, event: Event): void {
  const select = event.target as HTMLSelectElement;
  this.perRowStatuses.set(id, select.value);
}

  confirmAndExecute(action: 'approve' | 'reject'): void {
    if (this.selectedIds.size === 0) {
      Swal.fire('No selection', 'Please select at least one row.', 'warning');
      return;
    }

    const defaultStatus = action === 'approve' ? 'Resolved' : 'Rejected';

    // If your backend supports per-row comments/statuses, send a detailed array.
    const detailed = Array.from(this.selectedIds).map(id => {
      const row = this.tickets.find(r => r.raiseTicketApprovalId === id);
      return {
        raiseTicketApprovalId: id,
        raiseTicketId: row?.raiseTicketId,
        managerComments: this.perRowComments.get(id) || '',
        ticketStatus: this.perRowStatuses.get(id) || defaultStatus
      };
    });

    const payload = {
      raiseTicketApprovalIds: Array.from(this.selectedIds),
      managerComments: '',           // optional global note; using per-row above
      managerId: this.employeeId,    // current manager
      actionBy: this.employeeId,     // audit
      ticketStatus: defaultStatus
    };

    this.spinner.show();
    const call$ = action === 'approve' ? this.admin.bulkApprove(payload) : this.admin.bulkReject(payload);

    call$.pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: () => {
          Swal.fire('Success', `Tickets ${action}d successfully.`, 'success');
          this.selectedIds.clear();
          this.loadApprovalTickets();
        },
        error: (err) => {
          Swal.fire('Error', err?.error || `Failed to ${action} tickets.`, 'error');
        }
      });
  }
 
  toggleAll(ev: Event): void {
  const checked = (ev.target as HTMLInputElement).checked;
  this.selectedIds.clear();
  if (checked) {
    this.tickets.forEach(r => this.selectedIds.add(r.raiseTicketApprovalId));
  }
}

//Filter, Pagination, Sorting for Approval Tickets
selectedApprovalEmployee: string = '';
selectedApprovalStatus: string = '';
selectedApprovalCategory: string = '';
selectedApprovalDate: string = '';

filterApprovalTickets(data: ApprovalRow[]): ApprovalRow[] {
  return data.filter(r => {
    const matchEmployee = !this.selectedApprovalEmployee ||
      r.employeeId?.toString() === this.selectedApprovalEmployee ||
      r.employeeName?.toLowerCase().includes(this.selectedApprovalEmployee.toLowerCase());

    const matchStatus = !this.selectedApprovalStatus ||
      r.status?.toLowerCase() === this.selectedApprovalStatus.toLowerCase();

    const matchCategory = !this.selectedApprovalCategory ||
      this.categoryLabels[r.categoryId] === this.selectedApprovalCategory;

    const matchDate = !this.selectedApprovalDate ||
      (r.createdDate && new Date(r.createdDate).toISOString().slice(0, 10) === this.selectedApprovalDate);

    return matchEmployee && matchStatus && matchCategory && matchDate;
  });
}

get pagedApprovalTickets(): ApprovalRow[] {
  let data = [...this.tickets];
  data = this.filterApprovalTickets(data);
  // optionally sort/paginate like your base tickets
  return data;
}

applyApprovalFilters(): void {
  this.currentPage = 1; // reset pagination
}

clearApprovalFilters(): void {
  this.selectedApprovalEmployee = '';
  this.selectedApprovalStatus = '';
  this.selectedApprovalCategory = '';
  this.selectedApprovalDate = '';
  this.currentPage = 1;
}
     
}



