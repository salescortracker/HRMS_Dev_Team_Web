import { Component } from '@angular/core';
import { LeaveConfiguration } from '../../layout/models/leave-policy.model';
@Component({
  selector: 'app-leave-policy',
  standalone: false,
  templateUrl: './leave-policy.component.html',
  styleUrl: './leave-policy.component.css'
})
export class LeavePolicyComponent {
 leave: LeaveConfiguration = this.defaultLeave();
  leaveConfigurations: LeaveConfiguration[] = [];
  searchText = '';
  isEditMode = false;
  editIndex = -1;

  leaveTypes: string[] = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave'];
  roles: string[] = ['All Employees', 'Manager', 'HR', 'Admin'];

  ngOnInit(): void {}

  defaultLeave(): LeaveConfiguration {
    return {
      LeaveType: '',
      MaxLeaves: 0,
      CarryForward: false,
      EncashmentAllowed: false,
      ApplicableTo: '',
      Description: ''
    };
  }

  onSubmit() {
    if (this.isEditMode) {
      this.leaveConfigurations[this.editIndex] = { ...this.leave };
      this.isEditMode = false;
      this.editIndex = -1;
    } else {
      this.leaveConfigurations.push({ ...this.leave });
    }
    this.resetForm();
  }

  editLeave(item: LeaveConfiguration) {
    this.leave = { ...item };
    this.isEditMode = true;
    this.editIndex = this.leaveConfigurations.indexOf(item);
  }

  deleteLeave(index: number) {
    if (confirm('Are you sure you want to delete this leave configuration?')) {
      this.leaveConfigurations.splice(index, 1);
    }
  }

  filteredLeaves() {
    if (!this.searchText) return this.leaveConfigurations;
    return this.leaveConfigurations.filter(
      l => l.LeaveType.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  resetForm() {
    this.leave = this.defaultLeave();
    this.isEditMode = false;
  }
}
