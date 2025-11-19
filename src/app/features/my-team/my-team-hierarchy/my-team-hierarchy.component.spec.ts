import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTeamHierarchyComponent } from './my-team-hierarchy.component';

describe('MyTeamHierarchyComponent', () => {
  let component: MyTeamHierarchyComponent;
  let fixture: ComponentFixture<MyTeamHierarchyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyTeamHierarchyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyTeamHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
