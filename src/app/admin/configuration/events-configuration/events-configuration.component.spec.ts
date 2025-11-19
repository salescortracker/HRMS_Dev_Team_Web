import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsConfigurationComponent } from './events-configuration.component';

describe('EventsConfigurationComponent', () => {
  let component: EventsConfigurationComponent;
  let fixture: ComponentFixture<EventsConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventsConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
