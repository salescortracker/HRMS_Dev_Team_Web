import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseStatusComponent } from './expense-status.component';

describe('ExpenseStatusComponent', () => {
  let component: ExpenseStatusComponent;
  let fixture: ComponentFixture<ExpenseStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpenseStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
