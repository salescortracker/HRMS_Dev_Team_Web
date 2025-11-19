import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissedPunchRequestComponent } from './missed-punch-request.component';

describe('MissedPunchRequestComponent', () => {
  let component: MissedPunchRequestComponent;
  let fixture: ComponentFixture<MissedPunchRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MissedPunchRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissedPunchRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
