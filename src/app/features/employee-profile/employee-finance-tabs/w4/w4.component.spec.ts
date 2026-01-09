import { ComponentFixture, TestBed } from '@angular/core/testing';

import { W4Component } from './w4.component';

describe('W4Component', () => {
  let component: W4Component;
  let fixture: ComponentFixture<W4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [W4Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(W4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
