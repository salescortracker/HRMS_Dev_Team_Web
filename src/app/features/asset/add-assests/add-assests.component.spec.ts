import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAssestsComponent } from './add-assests.component';

describe('AddAssestsComponent', () => {
  let component: AddAssestsComponent;
  let fixture: ComponentFixture<AddAssestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddAssestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAssestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
