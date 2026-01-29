import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeuploadComponent } from './resumeupload.component';

describe('ResumeuploadComponent', () => {
  let component: ResumeuploadComponent;
  let fixture: ComponentFixture<ResumeuploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResumeuploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeuploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
