import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { InfiniteScrollService } from './infinite-scroll.service';
import { MatSelectInfiniteScrollDirective } from './mat-select-infinite-scroll.directive';
import { MatSelectInfiniteScrollModule } from './mat-select-infinite-scroll.module';

@Component({
  template: '<mat-select msInfiniteScroll></mat-select><mat-select msInfiniteScroll></mat-select>',
})
class Host {}

describe('MatSelectInfiniteScrollModule', () => {
  it('attaches the exported directive and gives each select a separate service', () => {
    TestBed.configureTestingModule({
      declarations: [Host],
      imports: [MatSelectModule, NoopAnimationsModule, MatSelectInfiniteScrollModule],
    });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const selects = fixture.debugElement.queryAll(By.directive(MatSelectInfiniteScrollDirective));
    expect(selects.length).toBe(2);
    expect(selects[0].injector.get(InfiniteScrollService)).not.toBe(
      selects[1].injector.get(InfiniteScrollService),
    );
  });
});
