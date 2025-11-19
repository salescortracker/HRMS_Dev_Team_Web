import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetStatusComponent } from './asset-status.component';

describe('AssetStatusComponent', () => {
  let component: AssetStatusComponent;
  let fixture: ComponentFixture<AssetStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
