import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiPerformanceComponent } from './kpi-performance.component';

describe('KpiPerformanceComponent', () => {
  let component: KpiPerformanceComponent;
  let fixture: ComponentFixture<KpiPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KpiPerformanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
