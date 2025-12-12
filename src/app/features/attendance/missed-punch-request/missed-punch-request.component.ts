import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdminService, MissedType, MissedPunchRequest, SubmitRequestDto, MissedPunchAction } from '../../../admin/servies/admin.service';

@Component({
  selector: 'app-missed-punch-request',
  templateUrl: './missed-punch-request.component.html',
  styleUrls: ['./missed-punch-request.component.css'],
  standalone: false
})
export class MissedPunchRequestComponent implements OnInit {

  requestForm!: FormGroup;
  managerRemarksForm!: FormGroup;

  missedTypes: MissedType[] = [];
  myRequests: MissedPunchRequest[] = [];
  pendingApprovals: MissedPunchRequest[] = [];

  selectedRequest: MissedPunchRequest | null = null;

  employeeID = 0;
  managerID = 0;
  companyID = 0;
  regionID: number | null = null;

  currentUserId = 0;
  roleName = '';

  // Pagination
  myRequestsPage = 1;
  pendingApprovalsPage = 1;
  pageSize = 5;

  // Track selected rows & comments for bulk action
  pendingSelections: { [key: number]: { selected: boolean; comment: string } } = {};

  // Spinner for submit request
  isSubmitting = false;

  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit(): void {
    const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');

    this.employeeID = user.userId || 0;
    this.managerID = user.reportingTo || 0;
    this.companyID = user.companyId || 0;
    this.regionID = user.regionId || 0;

    this.currentUserId = user.userId || 0;
    this.roleName = user.roleName || '';

    this.requestForm = this.fb.group({
      MissedDate: ['', Validators.required],
      MissedTypeID: [null, Validators.required],
      CorrectClockIn: [''],
      CorrectClockOut: [''],
      Reason: ['', Validators.required]
    });

    this.managerRemarksForm = this.fb.group({
      ManagerRemarks: ['']
    });

    this.loadMissedTypes();
  }

  // ------------------- Data Loading -------------------
  loadMissedTypes(): void {
    this.adminService.getMissedTypes().subscribe({
      next: res => {
        this.missedTypes = res || [];
        this.loadMyRequests();
        this.loadPendingApprovals();
      },
      error: err => {
        console.error('LoadMissedTypes error:', err);
        Swal.fire('Error', 'Unable to load missed types', 'error');
      }
    });
  }

  loadMyRequests(): void {
    if (!this.employeeID) return;

    this.adminService.getMyRequests(this.employeeID).subscribe({
      next: (res: any) => {
        if (!Array.isArray(res)) {
          if (res && Array.isArray(res.data)) res = res.data;
          else { this.myRequests = []; return; }
        }
        this.myRequests = res.map((r: any) => ({
          ...r,
          missedType: r.missedType || this.missedTypes.find((t:any) => t.missedTypeID === r.missedTypeID)?.missedType || '-',
          correctClockIn: r.correctClockIn ? new Date(r.correctClockIn) : null,
          correctClockOut: r.correctClockOut ? new Date(r.correctClockOut) : null
        }));
        this.myRequestsPage = 1;
      },
      error: err => {
        console.error('LoadMyRequests error:', err);
        Swal.fire('Error', 'Unable to load your requests', 'error');
      }
    });
  }

  loadPendingApprovals(): void {
    if (!this.currentUserId) return;

    this.adminService.getPendingApprovals(this.currentUserId).subscribe({
      next: res => {
        this.pendingApprovals = (res || []).map((r: any) => ({
          ...r,
          missedType: r.missedType || this.missedTypes.find((t:any) => t.missedTypeID === r.missedTypeID)?.missedType || '-',
          correctClockIn: r.correctClockIn ? new Date(r.correctClockIn) : null,
          correctClockOut: r.correctClockOut ? new Date(r.correctClockOut) : null
        }));
        this.pendingApprovalsPage = 1;

        // Initialize pendingSelections for all rows
        this.pendingApprovals.forEach(r => {
          if (!this.pendingSelections[r.missedPunchRequestID]) {
            this.pendingSelections[r.missedPunchRequestID] = { selected: false, comment: '' };
          }
        });
      },
      error: err => {
        console.error('LoadPendingApprovals error:', err);
        Swal.fire('Error', 'Unable to load pending approvals', 'error');
      }
    });
  }

  // ------------------- Pagination -------------------
  get pagedMyRequests() {
    const start = (this.myRequestsPage - 1) * this.pageSize;
    return this.myRequests.slice(start, start + this.pageSize);
  }

  get pagedPendingApprovals() {
    const start = (this.pendingApprovalsPage - 1) * this.pageSize;
    return this.pendingApprovals.slice(start, start + this.pageSize);
  }

  totalMyRequestsPages() { return Math.ceil(this.myRequests.length / this.pageSize); }
  totalPendingApprovalsPages() { return Math.ceil(this.pendingApprovals.length / this.pageSize); }

  changePageMyRequests(page: number) {
    if (page < 1 || page > this.totalMyRequestsPages()) return;
    this.myRequestsPage = page;
  }

  changePagePendingApprovals(page: number) {
    if (page < 1 || page > this.totalPendingApprovalsPages()) return;
    this.pendingApprovalsPage = page;
  }

  // ------------------- Form Actions -------------------
  submitRequest(): void {
    if (this.requestForm.invalid) return;

    this.isSubmitting = true; // 🔹 show spinner

    const missedDate = this.requestForm.value.MissedDate;
    const buildDateTime = (time: string | null) => time ? `${missedDate}T${time}:00` : null;

    const dto: SubmitRequestDto = {
      employeeID: this.employeeID,
      companyID: this.companyID,
      regionID: this.regionID,
      missedDate,
      missedTypeID: this.requestForm.value.MissedTypeID,
      correctClockIn: buildDateTime(this.requestForm.value.CorrectClockIn),
      correctClockOut: buildDateTime(this.requestForm.value.CorrectClockOut),
      reason: this.requestForm.value.Reason
    };

    this.adminService.submitRequest(dto).subscribe({
      next: () => {
        Swal.fire('Success', 'Request submitted successfully!', 'success');
        this.requestForm.reset();
        this.loadMyRequests();
        this.loadPendingApprovals();
        this.isSubmitting = false; // hide spinner
      },
      error: err => {
        console.error('SubmitRequest error:', err);
        Swal.fire('Error', 'Unable to submit request', 'error');
        this.isSubmitting = false; // hide spinner
      }
    });
  }

  selectRequest(req: MissedPunchRequest): void {
    this.selectedRequest = { ...req };
    this.managerRemarksForm.patchValue({ ManagerRemarks: this.selectedRequest.managerRemarks ?? '' });
  }

  // ------------------- Bulk Approve/Reject -------------------
  toggleSelection(req: MissedPunchRequest) {
    const id = req.missedPunchRequestID;
    if (!this.pendingSelections[id]) this.pendingSelections[id] = { selected: true, comment: '' };
    else this.pendingSelections[id].selected = !this.pendingSelections[id].selected;
  }

  updateComment(req: MissedPunchRequest, value: string) {
    const id = req.missedPunchRequestID;
    if (!this.pendingSelections[id]) this.pendingSelections[id] = { selected: false, comment: value };
    else this.pendingSelections[id].comment = value;
  }

  bulkApprove() { this.bulkAction('Approved'); }
  bulkReject() { this.bulkAction('Rejected'); }

  bulkAction(status: 'Approved' | 'Rejected') {
    const selectedRequests = Object.keys(this.pendingSelections)
      .filter(id => this.pendingSelections[+id].selected)
      .map(id => {
        const r = this.pendingApprovals.find(req => req.missedPunchRequestID === +id);
        return r ? {
          requestId: r.missedPunchRequestID,
          managerId: this.currentUserId,
          status,
          managerRemarks: this.pendingSelections[+id].comment || ''
        } : null;
      })
      .filter(x => x != null);

    if (!selectedRequests.length) {
      Swal.fire('Info', 'Please select at least one request', 'info');
      return;
    }

    selectedRequests.forEach((actionDto: any) => {
      this.adminService.takeAction(actionDto).subscribe({
        next: () => { this.loadPendingApprovals(); },
        error: err => { console.error('BulkAction error:', err); }
      });
    });

    Swal.fire('Success', `${status} successfully!`, 'success');
    this.pendingSelections = {};
  }
}
