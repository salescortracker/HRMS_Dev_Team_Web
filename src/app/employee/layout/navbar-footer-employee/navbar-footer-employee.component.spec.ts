import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarFooterEmployeeComponent } from './navbar-footer-employee.component';

describe('NavbarFooterEmployeeComponent', () => {
  let component: NavbarFooterEmployeeComponent;
  let fixture: ComponentFixture<NavbarFooterEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarFooterEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarFooterEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
