import { TestBed } from '@angular/core/testing';

import { RecruitmentsService } from './recruitments.service';

describe('RecruitmentsService', () => {
  let service: RecruitmentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecruitmentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
