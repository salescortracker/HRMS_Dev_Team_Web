import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificationTypeComponent } from './certification-type.component';

describe('CertificationTypeComponent', () => {
  let component: CertificationTypeComponent;
  let fixture: ComponentFixture<CertificationTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CertificationTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificationTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
