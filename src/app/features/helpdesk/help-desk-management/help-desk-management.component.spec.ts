import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpDeskManagementComponent } from './help-desk-management.component';

describe('HelpDeskManagementComponent', () => {
  let component: HelpDeskManagementComponent;
  let fixture: ComponentFixture<HelpDeskManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HelpDeskManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpDeskManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
