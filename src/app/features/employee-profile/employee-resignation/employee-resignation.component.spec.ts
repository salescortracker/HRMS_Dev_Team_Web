import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeResignationComponent } from './employee-resignation.component';

describe('EmployeeResignationComponent', () => {
  let component: EmployeeResignationComponent;
  let fixture: ComponentFixture<EmployeeResignationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeResignationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeResignationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
