import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarHrLayoutComponent } from './navbar-hr-layout.component';

describe('NavbarHrLayoutComponent', () => {
  let component: NavbarHrLayoutComponent;
  let fixture: ComponentFixture<NavbarHrLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarHrLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarHrLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
