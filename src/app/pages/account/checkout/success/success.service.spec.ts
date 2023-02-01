import { TestBed } from '@angular/core/testing';

import { SuccessService } from './success.service';

describe('SuccessService', () => {
  let service: SuccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
