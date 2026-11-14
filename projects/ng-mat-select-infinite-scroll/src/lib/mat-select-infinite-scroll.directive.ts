import {
  AfterViewInit,
  Directive,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { InfiniteScrollService, ScrollConfiguration } from './infinite-scroll.service';

/**
 * Requests more options when a standard Material select approaches its bottom.
 * Checks run on scroll, panel opening, option changes, and input changes.
 * The host fetches the data and binds its request state to loading/complete.
 *
 * Each instance owns its scroll listener. Closing or destroying the select
 * cancels pending work so an old panel cannot request another page.
 *
 * @example
 * <mat-select msInfiniteScroll [loading]="loading" [complete]="complete"
 *             (infiniteScroll)="loadNextPage()">
 *   ...options...
 * </mat-select>
 */
@Directive({
  selector: '[msInfiniteScroll]',
  standalone: true,
  providers: [InfiniteScrollService],
})
export class MatSelectInfiniteScrollDirective implements AfterViewInit, OnChanges, OnDestroy {
  /** Distance from the bottom: 0–100% of scroll height, or pixels such as '100px'/'100'. */
  @Input() threshold = '15%';

  /** Milliseconds to wait after the most recent scroll event. */
  @Input() debounceTime = 150;

  /** Stops requests when all data is loaded. Reset from true to false for a new dataset. */
  @Input() complete = false;

  /** Suppresses requests while the host is fetching a page. */
  @Input() loading = false;

  /** Requests the next page; the host appends options and updates loading/complete. */
  @Output() infiniteScroll = new EventEmitter<void>();

  private readonly subscriptions = new Subscription();
  private openTimer?: ReturnType<typeof setTimeout>;
  private checkTimer?: ReturnType<typeof setTimeout>;
  private connected = false;
  private destroyed = false;

  /** Previous option boundary, used to distinguish appends from replacements. */
  private optionCount = 0;
  private lastOption: unknown;

  /** Scroll position to restore after Material processes appended options. */
  private scrollAnchor?: number;

  constructor(
    protected readonly matSelect: MatSelect,
    private readonly scroll: InfiniteScrollService,
  ) {}

  /** Validate new bindings and recheck an already open panel. */
  ngOnChanges(changes: SimpleChanges): void {
    this.scroll.validate(this.configuration());
    if (changes['complete']?.previousValue === true && !this.complete) this.scroll.reset();
    this.scheduleCheck();
  }

  /** Subscribe once to the host's panel lifecycle and rendered option list. */
  ngAfterViewInit(): void {
    // Recheck when Material reports a transition. Its timing relative to
    // overlay creation differs between supported Material versions.
    this.subscriptions.add(
      this.matSelect.openedChange.subscribe((opened) => {
        if (!opened) this.closePanel();
        else if (!this.connected && this.openTimer === undefined) this.openPanel();
        else this.scheduleCheck();
      }),
    );
    // Also observe panelOpen changes so closing cancels pending work without
    // waiting for an overlay animation to finish.
    this.subscriptions.add(
      this.matSelect.stateChanges.subscribe(() => {
        if (!this.matSelect.panelOpen) this.closePanel();
        else if (!this.connected && this.openTimer === undefined) this.openPanel();
      }),
    );
    this.subscriptions.add(
      this.matSelect.options.changes.subscribe(() => {
        const count = this.matSelect.options.length;
        // A larger list is an append only if its previous last option survives
        // at the same index. Query replacements should retain the host's reset.
        if (
          this.connected &&
          this.optionCount > 0 &&
          count > this.optionCount &&
          this.matSelect.options.get(this.optionCount - 1) === this.lastOption
        ) {
          this.scrollAnchor = this.matSelect.panel?.nativeElement.scrollTop;
        }
        this.optionCount = count;
        this.lastOption = this.matSelect.options.last;
        this.scheduleCheck();
      }),
    );
    if (this.matSelect.panelOpen) this.openPanel();
  }

  /** Cancel panel work before removing the host subscriptions. */
  ngOnDestroy(): void {
    this.destroyed = true;
    this.closePanel();
    this.subscriptions.unsubscribe();
  }

  /** Wait for the overlay element, then attach the per-instance listener. */
  private openPanel(): void {
    // openedChange can fire before panel is available in some Material versions:
    // https://github.com/angular/components/issues/30596
    this.openTimer = setTimeout(() => {
      this.openTimer = undefined;
      const panel = this.matSelect.panel?.nativeElement as HTMLElement | undefined;
      if (this.destroyed || !this.matSelect.panelOpen || !panel) return;
      this.scroll.connect(
        panel,
        () => this.configuration(),
        () => this.infiniteScroll.emit(),
      );
      this.connected = true;
      this.optionCount = this.matSelect.options.length;
      this.lastOption = this.matSelect.options.last;
      this.scheduleCheck();
    });
  }

  /** Discard deferred initialization/checks as well as debounced scroll events. */
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

  /** Coalesce changes until the DOM updates; restore an append's anchor before measuring. */
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

  /** Read current inputs; a closed panel also suppresses any late callback. */
  private configuration(): ScrollConfiguration {
    return {
      threshold: this.threshold,
      debounceTime: this.debounceTime,
      complete: this.complete || !this.matSelect.panelOpen,
      loading: this.loading,
    };
  }
}
