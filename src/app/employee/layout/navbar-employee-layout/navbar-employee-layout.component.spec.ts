import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarEmployeeLayoutComponent } from './navbar-employee-layout.component';

describe('NavbarEmployeeLayoutComponent', () => {
  let component: NavbarEmployeeLayoutComponent;
  let fixture: ComponentFixture<NavbarEmployeeLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarEmployeeLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarEmployeeLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
