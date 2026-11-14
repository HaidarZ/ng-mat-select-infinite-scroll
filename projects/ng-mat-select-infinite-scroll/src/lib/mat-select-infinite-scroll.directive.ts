import { AfterViewInit, Directive, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { InfiniteScrollService, ScrollConfiguration } from './infinite-scroll.service';

@Directive({
  selector: '[msInfiniteScroll]',
  standalone: true,
  providers: [InfiniteScrollService]
})
export class MatSelectInfiniteScrollDirective implements AfterViewInit, OnChanges, OnDestroy {
  @Input() threshold = '15%';
  @Input() debounceTime = 150;
  @Input() complete = false;
  @Input() loading = false;
  @Output() infiniteScroll = new EventEmitter<void>();

  private readonly subscriptions = new Subscription();
  private openTimer?: ReturnType<typeof setTimeout>;
  private checkTimer?: ReturnType<typeof setTimeout>;
  private connected = false;
  private destroyed = false;
  private optionCount = 0;
  private lastOption: unknown;
  private scrollAnchor?: number;

  constructor(protected readonly matSelect: MatSelect, private readonly scroll: InfiniteScrollService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.scroll.validate(this.configuration());
    if (changes['complete']?.previousValue === true && !this.complete) this.scroll.reset();
    this.scheduleCheck();
  }

  ngAfterViewInit(): void {
    this.subscriptions.add(this.matSelect.openedChange.subscribe(opened => {
      if (!opened) this.closePanel();
      else if (!this.connected && this.openTimer === undefined) this.openPanel();
      else this.scheduleCheck();
    }));
    this.subscriptions.add(this.matSelect.stateChanges.subscribe(() => {
      if (!this.matSelect.panelOpen) this.closePanel();
      else if (!this.connected && this.openTimer === undefined) this.openPanel();
    }));
    this.subscriptions.add(this.matSelect.options.changes.subscribe(() => {
      const count = this.matSelect.options.length;
      if (this.connected && this.optionCount > 0 && count > this.optionCount &&
          this.matSelect.options.get(this.optionCount - 1) === this.lastOption) {
        this.scrollAnchor = this.matSelect.panel?.nativeElement.scrollTop;
      }
      this.optionCount = count;
      this.lastOption = this.matSelect.options.last;
      this.scheduleCheck();
    }));
    if (this.matSelect.panelOpen) this.openPanel();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.closePanel();
    this.subscriptions.unsubscribe();
  }

  private openPanel(): void {
    // Material versions differ in when the overlay panel becomes available.
    this.openTimer = setTimeout(() => {
      this.openTimer = undefined;
      const panel = this.matSelect.panel?.nativeElement as HTMLElement | undefined;
      if (this.destroyed || !this.matSelect.panelOpen || !panel) return;
      this.scroll.connect(panel, () => this.configuration(), () => this.infiniteScroll.emit());
      this.connected = true;
      this.optionCount = this.matSelect.options.length;
      this.lastOption = this.matSelect.options.last;
      this.scheduleCheck();
    });
  }

  private closePanel(): void {
    clearTimeout(this.openTimer);
    clearTimeout(this.checkTimer);
    this.openTimer = undefined;
    this.checkTimer = undefined;
    this.connected = false;
    this.scrollAnchor = undefined;
    this.lastOption = undefined;
    this.scroll.disconnect();
  }

  private scheduleCheck(): void {
    if (!this.connected || this.destroyed) return;
    clearTimeout(this.checkTimer);
    this.checkTimer = setTimeout(() => {
      this.checkTimer = undefined;
      if (this.connected && this.matSelect.panelOpen) {
        if (this.scrollAnchor !== undefined) {
          this.matSelect.panel.nativeElement.scrollTop = this.scrollAnchor;
          this.scrollAnchor = undefined;
        }
        this.scroll.check(this.matSelect.options.length);
      }
    });
  }

  private configuration(): ScrollConfiguration {
    return { threshold: this.threshold, debounceTime: this.debounceTime, complete: this.complete || !this.matSelect.panelOpen, loading: this.loading };
  }
}
