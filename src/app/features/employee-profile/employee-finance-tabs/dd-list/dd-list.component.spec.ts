import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DdListComponent } from './dd-list.component';

describe('DdListComponent', () => {
  let component: DdListComponent;
  let fixture: ComponentFixture<DdListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DdListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DdListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
