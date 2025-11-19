import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarHeaderEmployeeComponent } from './navbar-header-employee.component';

describe('NavbarHeaderEmployeeComponent', () => {
  let component: NavbarHeaderEmployeeComponent;
  let fixture: ComponentFixture<NavbarHeaderEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarHeaderEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarHeaderEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
