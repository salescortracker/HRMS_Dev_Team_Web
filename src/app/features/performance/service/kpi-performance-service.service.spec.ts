import { TestBed } from '@angular/core/testing';

import { KpiPerformanceServiceService } from './kpi-performance-service.service';

describe('KpiPerformanceServiceService', () => {
  let service: KpiPerformanceServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KpiPerformanceServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
