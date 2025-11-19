import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloodGroupMasterComponent } from './blood-group-master.component';

describe('BloodGroupMasterComponent', () => {
  let component: BloodGroupMasterComponent;
  let fixture: ComponentFixture<BloodGroupMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BloodGroupMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloodGroupMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
