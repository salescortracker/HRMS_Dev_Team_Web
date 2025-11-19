import { Component } from '@angular/core';
import { ApprovalWorkflow } from '../../layout/models/approval-workflow.mode';
@Component({
  selector: 'app-approval-workflow',
  standalone: false,
  templateUrl: './approval-workflow.component.html',
  styleUrl: './approval-workflow.component.css'
})
export class ApprovalWorkflowComponent {
 modules: string[] = ['Leave', 'Attendance', 'Expense', 'Payroll'];
  searchText: string = '';
  pageSize: number = 5;
  currentPage: number = 1;

  isEditMode: boolean = false;

  newWorkflow: ApprovalWorkflow = {
    id: 0,
    module: '',
    name: '',
    description: '',
    levels: [],
    isActive: true
  };

  workflows: ApprovalWorkflow[] = [
    {
      id: 1,
      module: 'Leave',
      name: 'Leave Approval',
      description: 'Approval workflow for leave requests',
      isActive: true,
      levels: [
        { level: 1, approver: 'Manager', email: 'manager@example.com', isActive: true },
        { level: 2, approver: 'HR', email: 'hr@example.com', isActive: true }
      ]
    },
    {
      id: 2,
      module: 'Expense',
      name: 'Expense Approval',
      description: 'Approval workflow for expenses',
      isActive: true,
      levels: [
        { level: 1, approver: 'Project Lead', email: 'lead@example.com', isActive: true },
        { level: 2, approver: 'Finance', email: 'finance@example.com', isActive: true }
      ]
    }
  ];

  addLevel() {
    const nextLevel = this.newWorkflow.levels.length + 1;
    this.newWorkflow.levels.push({ level: nextLevel, approver: '', email: '', isActive: true });
  }

  removeLevel(index: number) {
    this.newWorkflow.levels.splice(index, 1);
  }

  onSubmit() {
    if (this.isEditMode) {
      const index = this.workflows.findIndex(w => w.id === this.newWorkflow.id);
      if (index > -1) this.workflows[index] = { ...this.newWorkflow };
    } else {
      this.newWorkflow.id = this.workflows.length + 1;
      this.workflows.push({ ...this.newWorkflow });
    }
    this.resetForm();
  }

  resetForm() {
    this.newWorkflow = { id: 0, module: '', name: '', description: '', levels: [], isActive: true };
    this.isEditMode = false;
  }

  editWorkflow(workflow: ApprovalWorkflow) {
    this.newWorkflow = { ...workflow, levels: [...workflow.levels] };
    this.isEditMode = true;
  }

  deleteWorkflow(workflow: ApprovalWorkflow) {
    this.workflows = this.workflows.filter(w => w.id !== workflow.id);
  }

  filteredWorkflows() {
    return this.workflows.filter(w => w.name.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  totalPages() {
    return Math.ceil(this.filteredWorkflows().length / this.pageSize);
  }

  pagesArray() {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  paginatedWorkflows() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredWorkflows().slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
  }
}
