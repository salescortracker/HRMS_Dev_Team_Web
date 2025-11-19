import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyWorkingHoursComponent } from './daily-working-hours.component';

describe('DailyWorkingHoursComponent', () => {
  let component: DailyWorkingHoursComponent;
  let fixture: ComponentFixture<DailyWorkingHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DailyWorkingHoursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyWorkingHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
