import { TestBed } from '@angular/core/testing';

import { InfiniteScrollService } from './infinite-scroll.service';

describe('InfiniteScrollService', () => {
  let service: InfiniteScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfiniteScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
