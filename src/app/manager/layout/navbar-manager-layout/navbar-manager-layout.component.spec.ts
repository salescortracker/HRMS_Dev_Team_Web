import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarManagerLayoutComponent } from './navbar-manager-layout.component';

describe('NavbarManagerLayoutComponent', () => {
  let component: NavbarManagerLayoutComponent;
  let fixture: ComponentFixture<NavbarManagerLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarManagerLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarManagerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
