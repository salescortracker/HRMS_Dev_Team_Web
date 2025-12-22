import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../admin/configuration/events-configuration/events-configuration/event-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-events',
  standalone: false,
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.css'
})
export class MyEventsComponent implements OnInit {

  events: any[] = [];

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    const companyId = sessionStorage.getItem('CompanyId') ?? '0';
    const regionId = sessionStorage.getItem('RegionId') ?? '0';
    const userId = sessionStorage.getItem('UserId') ?? '0';

    this.eventService.getEvents(companyId, regionId, userId).subscribe({
      next: (res) => {
        this.events = res;
      },
      error: () => {
        Swal.fire('Error', 'Failed to load events', 'error');
      }
    });
  }
}
