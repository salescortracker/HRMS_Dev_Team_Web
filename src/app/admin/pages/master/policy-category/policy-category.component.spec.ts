import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyCategoryComponent } from './policy-category.component';

describe('PolicyCategoryComponent', () => {
  let component: PolicyCategoryComponent;
  let fixture: ComponentFixture<PolicyCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PolicyCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
