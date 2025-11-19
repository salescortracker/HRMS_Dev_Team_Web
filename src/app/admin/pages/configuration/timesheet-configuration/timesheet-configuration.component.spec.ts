import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetConfigurationComponent } from './timesheet-configuration.component';

describe('TimesheetConfigurationComponent', () => {
  let component: TimesheetConfigurationComponent;
  let fixture: ComponentFixture<TimesheetConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimesheetConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
