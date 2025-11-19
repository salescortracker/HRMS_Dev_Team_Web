import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyConfigurationComponent } from './hierarchy-configuration.component';

describe('HierarchyConfigurationComponent', () => {
  let component: HierarchyConfigurationComponent;
  let fixture: ComponentFixture<HierarchyConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HierarchyConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HierarchyConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
