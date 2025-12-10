import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeKpiSubmissionComponent } from './employee-kpi-submission.component';

describe('EmployeeKpiSubmissionComponent', () => {
  let component: EmployeeKpiSubmissionComponent;
  let fixture: ComponentFixture<EmployeeKpiSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeKpiSubmissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeKpiSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
