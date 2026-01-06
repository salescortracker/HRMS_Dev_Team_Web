import { Component, OnInit } from '@angular/core';
import { AdminService, TeamHierarchyDto } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';

// Reuse Employee interface for recursive tree
export interface Employee {
  employeeMasterId: number;
  fullName: string;
  role?: string | null;
  managerId?: number | null;
  subordinates: Employee[];
  expanded?: boolean; // for UI toggle
}

@Component({
  selector: 'app-my-team-hierarchy',
  templateUrl: './my-team-hierarchy.component.html',
  styleUrls: ['./my-team-hierarchy.component.css'],
  standalone: false // make sure it's not standalone
})
export class MyTeamHierarchyComponent implements OnInit {

  tree: Employee[] = [];
  loading: boolean = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    const loggedInUserId = Number(sessionStorage.getItem('UserId'));
    if (loggedInUserId) {
      this.loadMyTeam(loggedInUserId);
    } else {
      Swal.fire('Error', 'Logged-in user not found', 'error');
    }
  }

  loadMyTeam(managerUserId: number) {
    this.loading = true;
    this.adminService.getMyTeam(managerUserId).subscribe({
      next: (res: TeamHierarchyDto) => {
        this.tree = [this.mapToEmployee(res)];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Failed to load team hierarchy', 'error');
        this.loading = false;
      }
    });
  }

  // Map TeamHierarchyDto to Employee recursively
  private mapToEmployee(node: TeamHierarchyDto): Employee {
    return {
      employeeMasterId: node.employeeMasterId,
      fullName: node.fullName,
      role: node.role,
      managerId: node.managerId,
      expanded: true, // default expanded
      subordinates: node.subordinates.map(sub => this.mapToEmployee(sub))
    };
  }

  // Optional: expand/collapse toggle
  toggleNode(node: Employee) {
    node.expanded = !node.expanded;
  }
}
