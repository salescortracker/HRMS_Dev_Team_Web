import { Component } from '@angular/core';
import { KpiPerformanceServiceService, ManagerKpiReview } from '../service/kpi-performance-service.service';

@Component({
  selector: 'app-manager-kpi-review',
  standalone: false,
  templateUrl: './manager-kpi-review.component.html',
  styleUrl: './manager-kpi-review.component.css'
})
export class ManagerKpiReviewComponent {
 
  reviewList: ManagerKpiReview[] = [];

  managerId!: number;
  userId!: number;
  regionId!: number;
  companyId!: number;

  constructor(private reviewService: KpiPerformanceServiceService) {}

  ngOnInit(): void {

    // 🔥 TAKE VALUES FROM SESSION STORAGE (NO HARDCODED 0)
    this.managerId = Number(sessionStorage.getItem('UserId'));
    this.userId = Number(sessionStorage.getItem('UserId'));
    this.regionId = Number(sessionStorage.getItem('RegionId'));
    this.companyId = Number(sessionStorage.getItem('CompanyId'));

    this.loadReviews();
  }

  loadReviews() {
    this.reviewService.getReviews(this.managerId).subscribe({
      next: res => {
        this.reviewList = res;
      },
      error: err => {
        console.error(err);
        alert("Failed to load reviews.");
      }
    });
  }

  calculateAvg(row: ManagerKpiReview) {
    row.avgRating = row.managerRating;
  }

  updateStatus(status: 'Approved' | 'Rejected') {
  const selected = this.reviewList.filter(x => x.isSelected);

  if (selected.length === 0) {
    alert("No rows selected.");
    return;
  }

  // Build payload for backend
  // Note: For simplicity, we send the same rating/comments for all selected reviews
  const body = {
    reviewIds: selected.map(x => x.reviewId),
    status: status,
    managerRating: selected[0].managerRating || 0,    // first selected review's rating
    managerComments: selected[0].managerComments || '', // first selected review's comments
    managerId: this.managerId,
    userId: this.userId,
    regionId: this.regionId,
    companyId: this.companyId
  };

  this.reviewService.updateStatus(body).subscribe({
    next: () => {
      selected.forEach(x => {
        x.status = status;
        x.isSelected = false;
      });

      this.reviewList = [...this.reviewList];
      alert(`${status} successfully!`);
    },
    error: err => {
      console.error(err);
      alert(`Failed to update status to ${status}.`);
    }
  });
}

}
