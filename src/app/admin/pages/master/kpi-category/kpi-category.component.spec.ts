import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiCategoryComponent } from './kpi-category.component';

describe('KpiCategoryComponent', () => {
  let component: KpiCategoryComponent;
  let fixture: ComponentFixture<KpiCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KpiCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
