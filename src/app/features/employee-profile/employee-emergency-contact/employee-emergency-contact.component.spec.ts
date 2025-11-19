import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeEmergencyContactComponent } from './employee-emergency-contact.component';

describe('EmployeeEmergencyContactComponent', () => {
  let component: EmployeeEmergencyContactComponent;
  let fixture: ComponentFixture<EmployeeEmergencyContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeEmergencyContactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeEmergencyContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
