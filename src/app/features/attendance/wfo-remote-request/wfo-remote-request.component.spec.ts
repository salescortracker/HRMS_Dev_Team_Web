import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfoRemoteRequestComponent } from './wfo-remote-request.component';

describe('WfoRemoteRequestComponent', () => {
  let component: WfoRemoteRequestComponent;
  let fixture: ComponentFixture<WfoRemoteRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WfoRemoteRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfoRemoteRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
