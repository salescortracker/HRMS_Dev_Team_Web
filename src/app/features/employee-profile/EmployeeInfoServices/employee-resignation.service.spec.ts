import { TestBed } from '@angular/core/testing';

import { EmployeeResignationService } from './employee-resignation.service';

describe('EmployeeResignationService', () => {
  let service: EmployeeResignationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeResignationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
