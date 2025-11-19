import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalBusinessCardComponent } from './digital-business-card.component';

describe('DigitalBusinessCardComponent', () => {
  let component: DigitalBusinessCardComponent;
  let fixture: ComponentFixture<DigitalBusinessCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DigitalBusinessCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DigitalBusinessCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
