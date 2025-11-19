import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftAllocationComponent } from './shift-allocation.component';

describe('ShiftAllocationComponent', () => {
  let component: ShiftAllocationComponent;
  let fixture: ComponentFixture<ShiftAllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShiftAllocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
