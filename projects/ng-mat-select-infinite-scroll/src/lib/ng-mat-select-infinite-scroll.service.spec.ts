import { TestBed } from '@angular/core/testing';

import { NgMatSelectInfiniteScrollService } from './ng-mat-select-infinite-scroll.service';

describe('NgMatSelectInfiniteScrollService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgMatSelectInfiniteScrollService = TestBed.get(NgMatSelectInfiniteScrollService);
    expect(service).toBeTruthy();
  });
});
