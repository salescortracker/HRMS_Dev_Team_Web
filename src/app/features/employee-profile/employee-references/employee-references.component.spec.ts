import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeReferencesComponent } from './employee-references.component';

describe('EmployeeReferencesComponent', () => {
  let component: EmployeeReferencesComponent;
  let fixture: ComponentFixture<EmployeeReferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeReferencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
