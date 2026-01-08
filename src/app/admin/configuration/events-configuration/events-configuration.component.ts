import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../servies/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-events-configuration',
    standalone: false,   // 👈 THIS (explicit or implicit)

  templateUrl: './events-configuration.component.html',
  styleUrl: './events-configuration.component.css'
})
export class EventsConfigurationComponent implements OnInit {
companyId = sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : 1;
  regionId = sessionStorage.getItem('RegionId') ? Number(sessionStorage.getItem('RegionId')) : 1;
userId = sessionStorage.getItem('userId') ? Number(sessionStorage.getItem('userId')) : 1;

// Expose Math to template
Math = Math;
  
  isEdit: boolean = false;
  events: any[] = [];
  filteredEvents: any[] = []; // data shown in UI
  eventTypes: any[] = []; 

  eventForm: any = {
      eventId: 0,    
    eventName: '',
    eventTypeId: null,
    eventDate: '',
    description: '',
    companyId: this.companyId,
    regionId: this.regionId,
    userId: this.userId,
    
  };
searchText: string = '';
fromDate: string = '';
toDate: string = '';

// Pagination
currentPage: number = 1;
pageSize: number = 10;
totalEvents: number = 0;
pageSizes: number[] = [5, 10, 25, 50];

  constructor(private eventService: AdminService) {}

  ngOnInit(): void {
    this.loadEventTypes();
    this.loadEvents();
  }

  loadEventTypes() {
    this.eventService.getEventTypes().subscribe(res => {
      this.eventTypes = res;
    });
  }
loadEvents(callback?: () => void) {
  this.eventService.getEvents(this.companyId, this.regionId).subscribe({
    next: (res) => {
      this.events = res;
      this.filteredEvents = [...res];

      if (callback) callback(); // 👈 apply filter AFTER load
    },
    error: () => {
      Swal.fire('Error', 'Failed to load events', 'error');
    }
  });
}

saveEvent() {

  if (!this.eventForm.eventName || !this.eventForm.eventTypeId) {
    Swal.fire('Validation', 'Event Name & Type are required', 'warning');
    return;
  }

this.eventForm.eventDate = this.eventForm.eventDate
  ? this.eventForm.eventDate + 'T00:00:00'
  : null;


  if (this.isEdit && this.eventForm.eventId > 0) {

    this.eventService
      .updateEvent(this.eventForm.eventId, this.eventForm)
      .subscribe({
        next: () => {
          Swal.fire('Updated', 'Event updated successfully', 'success');

          this.isEdit = false;
          this.resetForm();

          this.loadEvents(() => this.applyFilter());
        },
        error: () => {
          Swal.fire('Error', 'Update failed', 'error');
        }
      });

  } else {

    this.eventService.createEvent(this.eventForm).subscribe({
      next: () => {
        Swal.fire('Created', 'Event created successfully', 'success');

        this.resetForm();
        this.loadEvents(() => this.applyFilter());
      },
      error: () => {
        Swal.fire('Error', 'Create failed', 'error');
      }
    });
  }
}

resetForm() {
  this.isEdit = false;

  this.eventForm = {
    eventId: 0,
    eventName: '',
    eventTypeId: null,
    eventDate: '',
    description: '',
    companyId: this.companyId,
    regionId: this.regionId,
    userId: this.userId
  };
}


  // ✅ MOVE LOGIC FROM HTML TO TS (ERROR 2 FIXED)
  getEventTypeName(eventTypeId: number): string {
    const type = this.eventTypes.find(t => t.eventTypeId === eventTypeId);
    return type ? type.eventTypeName : '-';
  }
editEvent(e: any) {
  this.isEdit = true;

  this.eventForm = {
    eventId: e.eventId,
    eventName: e.eventName,
    eventTypeId: e.eventTypeId,
    eventDate: e.eventDate?.split('T')[0],
    description: e.description,
    companyId: this.companyId,
    userId: this.userId,
    regionId: this.regionId
  };
}
deleteEvent(id: number) {

  Swal.fire({
    title: 'Are you sure?',
    text: 'This event will be deleted',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!'
  }).then(result => {

    if (result.isConfirmed) {
      this.eventService.deleteEvent(id, this.userId).subscribe({
        next: () => {
          Swal.fire('Deleted!', 'Event deleted successfully', 'success');

          this.loadEvents(() => this.applyFilter());
        },
        error: () => {
          Swal.fire('Error', 'Delete failed', 'error');
        }
      });
    }

  });
}

applyFilter() {
  let filtered = this.events.filter(e => {

    const matchesText =
      !this.searchText ||
      e.eventName?.toLowerCase().includes(this.searchText.toLowerCase());

    const eventDate = new Date(e.eventDate);
    eventDate.setHours(0, 0, 0, 0);

    const from = this.fromDate ? new Date(this.fromDate) : null;
    const to = this.toDate ? new Date(this.toDate) : null;

    from?.setHours(0, 0, 0, 0);
    to?.setHours(23, 59, 59, 999);

    const matchesFrom = !from || eventDate >= from;
    const matchesTo = !to || eventDate <= to;

    return matchesText && matchesFrom && matchesTo;
  });

  this.totalEvents = filtered.length;
  this.currentPage = 1;
  this.updatePaginatedEvents(filtered);
}

updatePaginatedEvents(data: any[]) {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.filteredEvents = data.slice(startIndex, endIndex);
}

goPrevious() {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.applyFilter();
  }
}

goNext() {
  if (this.currentPage < this.getTotalPages()) {
    this.currentPage++;
    this.applyFilter();
  }
}

goToPage(page: number) {
  if (page > 0 && page <= this.getTotalPages()) {
    this.currentPage = page;
    this.applyFilter();
  }
}

changePageSize(size: number) {
  this.pageSize = size;
  this.currentPage = 1;
  this.applyFilter();
}

getTotalPages(): number {
  return Math.ceil(this.totalEvents / this.pageSize);
}

getPageNumbers(): number[] {
  const total = this.getTotalPages();
  const pages: number[] = [];
  for (let i = 1; i <= total; i++) {
    pages.push(i);
  }
  return pages;
}


}
