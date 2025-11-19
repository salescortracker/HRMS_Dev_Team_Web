import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyPoliciesComponent } from './company-policies.component';

describe('CompanyPoliciesComponent', () => {
  let component: CompanyPoliciesComponent;
  let fixture: ComponentFixture<CompanyPoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompanyPoliciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
