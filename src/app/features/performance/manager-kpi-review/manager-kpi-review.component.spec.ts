import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerKpiReviewComponent } from './manager-kpi-review.component';

describe('ManagerKpiReviewComponent', () => {
  let component: ManagerKpiReviewComponent;
  let fixture: ComponentFixture<ManagerKpiReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManagerKpiReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerKpiReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
