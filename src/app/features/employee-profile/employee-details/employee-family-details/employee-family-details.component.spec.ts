import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeFamilyDetailsComponent } from './employee-family-details.component';

describe('EmployeeFamilyDetailsComponent', () => {
  let component: EmployeeFamilyDetailsComponent;
  let fixture: ComponentFixture<EmployeeFamilyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeFamilyDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeFamilyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
