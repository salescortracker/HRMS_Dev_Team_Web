import { TestBed } from '@angular/core/testing';

import { CompanyNewsService } from './company-news.service';

describe('CompanyNewsService', () => {
  let service: CompanyNewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyNewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
