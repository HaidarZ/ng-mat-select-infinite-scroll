import {AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {MatSelect, SELECT_ITEM_HEIGHT_EM, SELECT_PANEL_MAX_HEIGHT} from '@angular/material';
import {auditTime, takeUntil, tap} from 'rxjs/operators';
import {fromEvent, Subject, Subscription} from 'rxjs';

@Directive({
  selector: '[msInfiniteScroll]'
})
export class InfiniteScrollDirective implements OnInit, OnDestroy, AfterViewInit {

  @Input() threshold = '15%';
  @Input() complete: boolean;
  @Output() infiniteScroll = new EventEmitter<null>();

  private thrPx = 0;
  private thrPc = 0;

  private onDestroy = new Subject<void>();
  private scrollSubscription: Subscription;

  constructor(private element: ElementRef, private matSelect: MatSelect) {
  }

  ngOnInit() {
    this.evaluateThreshold();
  }

  ngAfterViewInit() {
    this.matSelect.openedChange.subscribe((opened) => {
      if (opened) {
        this.registerScrollListener();
      }
    });
  }

  ngOnDestroy() {
    if (this.scrollSubscription && this.scrollSubscription.unsubscribe) {
      this.scrollSubscription.unsubscribe();
    }
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  evaluateThreshold() {
    if (this.threshold.lastIndexOf('%') > -1) {
      this.thrPx = 0;
      this.thrPc = (parseFloat(this.threshold) / 100);

    } else {
      this.thrPx = parseFloat(this.threshold);
      this.thrPc = 0;
    }
  }

  registerScrollListener() {
    const panel = this.matSelect.panel.nativeElement;
    this.scrollSubscription = fromEvent(panel, 'scroll').pipe(
      takeUntil(this.onDestroy),
      auditTime(300),
      tap((event) => {
        this.loadAllOnScroll(event);
      })
    ).subscribe();
  }

  loadAllOnScroll(event) {
    if (this.complete) {
      return;
    }
    const singleOptionHeight = this.getSelectItemHeightPx();
    const countOfRenderedOptions = this.matSelect.options.length;
    const infiniteScrollDistance = singleOptionHeight * countOfRenderedOptions;
    const threshold = this.thrPc !== 0 ? (infiniteScrollDistance * this.thrPc) : this.thrPx;

    const scrolledDistance = SELECT_PANEL_MAX_HEIGHT + event.target.scrollTop;

    if ((scrolledDistance + threshold) >= infiniteScrollDistance) {
      this.infiniteScroll.emit();
    }
  }

  getSelectItemHeightPx(): number {
    return parseFloat(getComputedStyle(this.matSelect.panel.nativeElement).fontSize) * SELECT_ITEM_HEIGHT_EM;
  }


}
