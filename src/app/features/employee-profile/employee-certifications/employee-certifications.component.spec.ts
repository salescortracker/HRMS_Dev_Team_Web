import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeCertificationsComponent } from './employee-certifications.component';

describe('EmployeeCertificationsComponent', () => {
  let component: EmployeeCertificationsComponent;
  let fixture: ComponentFixture<EmployeeCertificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeCertificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeCertificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
