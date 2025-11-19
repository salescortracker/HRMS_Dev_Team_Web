import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileAppConfigurationComponent } from './mobile-app-configuration.component';

describe('MobileAppConfigurationComponent', () => {
  let component: MobileAppConfigurationComponent;
  let fixture: ComponentFixture<MobileAppConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MobileAppConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileAppConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
