import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetApplicationComponent } from './timesheet-application.component';

describe('TimesheetApplicationComponent', () => {
  let component: TimesheetApplicationComponent;
  let fixture: ComponentFixture<TimesheetApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimesheetApplicationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
