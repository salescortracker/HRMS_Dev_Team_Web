import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarningsDeductionsComponent } from './earnings-deductions.component';

describe('EarningsDeductionsComponent', () => {
  let component: EarningsDeductionsComponent;
  let fixture: ComponentFixture<EarningsDeductionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EarningsDeductionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EarningsDeductionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
