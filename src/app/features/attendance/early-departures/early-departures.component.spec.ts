import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarlyDeparturesComponent } from './early-departures.component';

describe('EarlyDeparturesComponent', () => {
  let component: EarlyDeparturesComponent;
  let fixture: ComponentFixture<EarlyDeparturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EarlyDeparturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EarlyDeparturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
