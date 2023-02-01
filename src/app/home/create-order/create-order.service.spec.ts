import { TestBed } from '@angular/core/testing';

import { CreateOrderService } from './create-order.service';

describe('CreateOrderService', () => {
  let service: CreateOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
