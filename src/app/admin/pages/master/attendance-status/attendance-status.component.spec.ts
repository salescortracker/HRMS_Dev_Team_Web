import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceStatusComponent } from './attendance-status.component';

describe('AttendanceStatusComponent', () => {
  let component: AttendanceStatusComponent;
  let fixture: ComponentFixture<AttendanceStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttendanceStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
