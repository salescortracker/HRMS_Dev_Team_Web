import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarFinanceLayoutComponent } from './navbar-finance-layout.component';

describe('NavbarFinanceLayoutComponent', () => {
  let component: NavbarFinanceLayoutComponent;
  let fixture: ComponentFixture<NavbarFinanceLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarFinanceLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarFinanceLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
