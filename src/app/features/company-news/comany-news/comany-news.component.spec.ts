import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComanyNewsComponent } from './comany-news.component';

describe('ComanyNewsComponent', () => {
  let component: ComanyNewsComponent;
  let fixture: ComponentFixture<ComanyNewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComanyNewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComanyNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
