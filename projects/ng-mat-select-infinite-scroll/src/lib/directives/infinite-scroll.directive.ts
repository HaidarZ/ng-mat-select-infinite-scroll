import {AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {MatSelect, SELECT_ITEM_HEIGHT_EM, SELECT_PANEL_MAX_HEIGHT} from '@angular/material';
import {auditTime, takeUntil, tap} from 'rxjs/operators';
import {fromEvent, Subject} from 'rxjs';

@Directive({
  selector: '[msInfiniteScroll]'
})
export class InfiniteScrollDirective implements OnDestroy, AfterViewInit {

  @Input() complete: boolean;
  @Output() infiniteScroll = new EventEmitter<null>();
  private onDestroy = new Subject<void>();

  constructor(private element: ElementRef, private matSelect: MatSelect) {
  }

  ngAfterViewInit() {
    this.matSelect.openedChange.subscribe((opened) => {
      if (opened) {
        this.registerOriginInfiniteScroll();
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  registerOriginInfiniteScroll() {
    const panel = this.matSelect.panel.nativeElement;
    fromEvent(panel, 'scroll').pipe(
      takeUntil(this.onDestroy),
      auditTime(300),
      tap((event) => {
        this.loadAllOnScroll(event);
      })
    ).subscribe();
  }

  loadAllOnScroll(event) {
    const singleItemSize = this.getItemHeightPx();
    const countOfRenderedItems = this.matSelect.options.length;
    const infiniteScrollDistance = singleItemSize * countOfRenderedItems;
    const scrolledUntilNow = SELECT_PANEL_MAX_HEIGHT + event.target.scrollTop;
    if (scrolledUntilNow >= infiniteScrollDistance && !this.complete) {
      this.infiniteScroll.emit();
    }
  }

  getItemHeightPx(): number {
    return parseFloat(getComputedStyle(this.matSelect.panel.nativeElement).fontSize) * SELECT_ITEM_HEIGHT_EM;
  }


}
