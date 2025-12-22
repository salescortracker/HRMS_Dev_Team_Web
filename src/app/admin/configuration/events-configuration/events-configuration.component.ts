import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { EventService } from './events-configuration/event-service.service';
import { AdminService } from '../../servies/admin.service';
import { create } from 'domain';

@Component({
  selector: 'app-events-configuration',
  standalone: false,
  templateUrl: './events-configuration.component.html',
  styleUrls: ['./events-configuration.component.css']
})
export class EventsConfigurationComponent implements OnInit {

  eventForm!: FormGroup;
  eventTypes: any[] = [];
  events: any[] = [];
  roles: any[] = [];
  today!: string;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.today = new Date().toISOString().split('T')[0];
    this.initForm();
    this.loadEventTypes();
    this.loadRoles();
    this.loadEvents();
  }

  initForm() {
    this.eventForm = this.fb.group({
      eventId: [null],
      eventName: ['', Validators.required],
      eventTypeId: ['', Validators.required],
      eventDate: ['', [Validators.required, this.noPastDateValidator]],
      roleId: [0],  
      description: ['']
    });
  }

  noPastDateValidator(control: any) {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate < today ? { pastDate: true } : null;
  }

  loadEventTypes() {
    this.eventService.getEventTypes().subscribe({
      next: res => this.eventTypes = res,
      error: () => Swal.fire('Error', 'Failed to load event types', 'error')
    });
  }

  loadRoles() {
    this.adminService.getroles().subscribe({
      next: res => {
        this.roles = [
          { roleId: 0, roleName: 'Select Role' },
          ...res.map((r: any) => ({
            roleId: r.RoleID ?? r.roleId,
            roleName: r.RoleName ?? r.roleName
          }))
        ];
      },
      error: () => Swal.fire('Error', 'Failed to load roles', 'error')
    });
  }

  loadEvents() {
    const companyId = sessionStorage.getItem('CompanyId') || '0';
    const regionId = sessionStorage.getItem('RegionId') || '0';
    const userId = sessionStorage.getItem('UserId') || '0';
    const roleId = this.eventForm.get('roleId')?.value || 0;
    

    console.log('Loading events...', { companyId, regionId, userId, roleId });

    this.eventService.getEvents(companyId, regionId, userId, roleId.toString())
      .subscribe({
        next: (res) => {
          console.log('Events loaded:', res);
          this.events = res;
        },
        error: (err) => {
          console.error('Error loading events:', err);
          Swal.fire('Error', 'Failed to load events', 'error');
        }
      });
  }
saveEvent() {
  if (this.eventForm.invalid) {
    Swal.fire('Validation Error', 'Please fill all required fields', 'warning');
    return;
  }

  const formValue = this.eventForm.value;
  const id = formValue.eventId;

  const eventData = {
    ...formValue,
    CompanyID: parseInt(sessionStorage.getItem('CompanyId') || '0'),
    RegionID: parseInt(sessionStorage.getItem('RegionId') || '0'),
    UserID: parseInt(sessionStorage.getItem('UserId') || '0'),
    RoleId: formValue.roleId || 0
    // create: parseInt(sessionStorage.getItem('UserId') || '0')
  };

  console.log('Sending event data:', eventData);

  if (id) {
    this.eventService.updateEvent(id, eventData).subscribe({
      next: () => {
        Swal.fire('Updated', 'Event updated successfully', 'success');
        this.resetForm();
        this.loadEvents();
      },
      error: (err) => {
        console.error('Update error:', err);
        Swal.fire('Error', 'Unable to update event', 'error');
      }
    });
  } else {
    this.eventService.createEvent(eventData).subscribe({
      next: (response) => {
        console.log('Create response:', response);
        Swal.fire('Created', 'Event created successfully', 'success');
        this.resetForm();
        this.loadEvents();
      },
      error: (err) => {
        console.error('Create error:', err);
        Swal.fire('Error', 'Unable to create event', 'error');
      }
    });
  }
}

  resetForm() {
    this.eventForm.reset({ roleId: 0 });
  }

  editEvent(id: number) {
    this.eventService.getEventById(id).subscribe(res => {
      this.eventForm.patchValue({
        ...res,
        roleId: res.roleId || 0
      });
    });
  }

  deleteEvent(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This event will be deleted',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it'
    }).then(result => {
      if (result.isConfirmed) {
        this.eventService.deleteEvent(id).subscribe({
          next: () => {
            Swal.fire('Deleted', 'Event deleted successfully', 'success');
            this.loadEvents();
          },
          error: () => Swal.fire('Error', 'Failed to delete event', 'error')
        });
      }
    });
  }
}