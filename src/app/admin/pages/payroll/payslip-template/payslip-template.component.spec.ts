import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayslipTemplateComponent } from './payslip-template.component';

describe('PayslipTemplateComponent', () => {
  let component: PayslipTemplateComponent;
  let fixture: ComponentFixture<PayslipTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayslipTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayslipTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
