import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLettersComponent } from './employee-letters.component';

describe('EmployeeLettersComponent', () => {
  let component: EmployeeLettersComponent;
  let fixture: ComponentFixture<EmployeeLettersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeLettersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeLettersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
