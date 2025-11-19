import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollSettingsComponent } from './payroll-settings.component';

describe('PayrollSettingsComponent', () => {
  let component: PayrollSettingsComponent;
  let fixture: ComponentFixture<PayrollSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayrollSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
