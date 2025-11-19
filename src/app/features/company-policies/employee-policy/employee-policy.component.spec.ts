import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePolicyComponent } from './employee-policy.component';

describe('EmployeePolicyComponent', () => {
  let component: EmployeePolicyComponent;
  let fixture: ComponentFixture<EmployeePolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeePolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
