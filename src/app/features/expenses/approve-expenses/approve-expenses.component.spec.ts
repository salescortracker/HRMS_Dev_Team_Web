import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveExpensesComponent } from './approve-expenses.component';

describe('ApproveExpensesComponent', () => {
  let component: ApproveExpensesComponent;
  let fixture: ComponentFixture<ApproveExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApproveExpensesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
