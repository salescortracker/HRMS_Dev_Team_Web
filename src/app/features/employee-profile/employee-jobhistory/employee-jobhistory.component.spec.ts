import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeJobhistoryComponent } from './employee-jobhistory.component';

describe('EmployeeJobhistoryComponent', () => {
  let component: EmployeeJobhistoryComponent;
  let fixture: ComponentFixture<EmployeeJobhistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeJobhistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeJobhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
