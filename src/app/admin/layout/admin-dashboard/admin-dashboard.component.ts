import { Component, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  stats = [
    { title: 'Employees', value: 124, icon: 'fa-users', color: '#922b21' },
    { title: 'Active Projects', value: 12, icon: 'fa-briefcase', color: '#1e88e5' },
    { title: 'Pending Leaves', value: 7, icon: 'fa-calendar-days', color: '#f39c12' },
    { title: 'Total Payroll', value: '₹4.8L', icon: 'fa-indian-rupee-sign', color: '#43a047' }
  ];

  leaveSummary = [
    { type: 'Casual Leave', used: 4, total: 12 },
    { type: 'Sick Leave', used: 2, total: 10 },
    { type: 'Earned Leave', used: 5, total: 15 }
  ];

  payrollSummary = [
    { name: 'November 2025', processed: true, amount: 480000 },
    { name: 'October 2025', processed: true, amount: 472000 },
    { name: 'September 2025', processed: false, amount: 0 }
  ];

  recentActivities = [
    { action: 'Added new employee', user: 'Admin', time: '5 mins ago' },
    { action: 'Approved leave request', user: 'HR Manager', time: '1 hr ago' },
    { action: 'Processed payroll', user: 'Finance', time: '3 hrs ago' },
    { action: 'Updated project status', user: 'PMO', time: 'Yesterday' }
  ];

  ngAfterViewInit() {
    setTimeout(() => {
      this.initPerformanceChart();
      this.initDeptChart();
    }, 200);
  }

  initPerformanceChart() {
    new Chart('performanceChart', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Attendance %',
            data: [94, 96, 92, 97, 95, 93],
            borderColor: '#922b21',
            backgroundColor: 'rgba(146,43,33,0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Performance %',
            data: [88, 91, 85, 90, 87, 89],
            borderColor: '#1e88e5',
            backgroundColor: 'rgba(30,136,229,0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 10 } }
        }
      }
    });
  }

  initDeptChart() {
    new Chart('deptChart', {
      type: 'doughnut',
      data: {
        labels: ['HR', 'Engineering', 'Sales', 'Finance', 'Support'],
        datasets: [
          {
            data: [10, 50, 20, 8, 12],
            backgroundColor: ['#922b21', '#1e88e5', '#43a047', '#fbc02d', '#8e24aa'],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}
