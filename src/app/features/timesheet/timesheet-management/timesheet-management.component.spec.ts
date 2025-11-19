import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetManagementComponent } from './timesheet-management.component';

describe('TimesheetManagementComponent', () => {
  let component: TimesheetManagementComponent;
  let fixture: ComponentFixture<TimesheetManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimesheetManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
