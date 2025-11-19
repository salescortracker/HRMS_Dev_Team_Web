import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayGroupsComponent } from './pay-groups.component';

describe('PayGroupsComponent', () => {
  let component: PayGroupsComponent;
  let fixture: ComponentFixture<PayGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayGroupsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
