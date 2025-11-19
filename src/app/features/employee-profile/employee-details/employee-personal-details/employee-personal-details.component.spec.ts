import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePersonalDetailsComponent } from './employee-personal-details.component';

describe('EmployeePersonalDetailsComponent', () => {
  let component: EmployeePersonalDetailsComponent;
  let fixture: ComponentFixture<EmployeePersonalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeePersonalDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePersonalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
