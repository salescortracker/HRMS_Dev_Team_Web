import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeImmigrationComponent } from './employee-immigration.component';

describe('EmployeeImmigrationComponent', () => {
  let component: EmployeeImmigrationComponent;
  let fixture: ComponentFixture<EmployeeImmigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeImmigrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeImmigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
