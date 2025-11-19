import { Component } from '@angular/core';

@Component({
  selector: 'app-my-events',
  standalone: false,
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.css'
})
export class MyEventsComponent {
events = [
  { name: 'Annual Awards', type: 'Company Event', date: new Date('2025-10-15'), description: 'Recognizing top performers.' },
  { name: 'Diwali Holiday', type: 'Holiday', date: new Date('2025-11-02'), description: 'Office closed for Diwali.' },
  { name: 'HR Policy Update', type: 'Announcement', date: new Date('2025-10-10'), description: 'New HR policy released.' },
  { name: 'Team Outing', type: 'Event', date: new Date('2025-10-20'), description: 'Annual team bonding event.' },
];

}
