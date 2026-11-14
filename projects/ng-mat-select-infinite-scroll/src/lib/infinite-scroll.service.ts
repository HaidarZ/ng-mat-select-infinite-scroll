import { Injectable, NgZone } from '@angular/core';
import { debounce, fromEvent, Subscription, timer } from 'rxjs';

/** Current directive inputs, read when an event/check runs rather than captured on open. */
export interface ScrollConfiguration {
  threshold: string;
  debounceTime: number;
  complete: boolean;
  loading: boolean;
}

/**
 * Measures one open panel and owns its debounced scroll subscription.
 * Listening stays outside Angular; a page request re-enters Angular so the host
 * can update its view. The directive provides a separate service per select.
 */
@Injectable()
export class InfiniteScrollService {
  private subscription?: Subscription;
  private panel?: HTMLElement;
  private configuration?: () => ScrollConfiguration;
  private callback?: () => void;
  /** Last requested geometry/count, used to prevent automatic retry loops. */
  private lastRequestKey?: string;
  private optionCount = 0;

  constructor(private readonly ngZone: NgZone) {}

  /** Throw RangeError for malformed thresholds or non-finite/negative delays. */
  validate(config: ScrollConfiguration): void {
    this.thresholdPixels(config.threshold, 1);
    if (!Number.isFinite(config.debounceTime) || config.debounceTime < 0) {
      throw new RangeError('debounceTime must be a finite, non-negative number');
    }
  }

  /**
   * Replace any old listener with this panel's scroll stream.
   * The configuration callback keeps loading/complete and other inputs live.
   */
  connect(
    panel: HTMLElement,
    configuration: () => ScrollConfiguration,
    callback: () => void,
  ): void {
    this.disconnect();
    this.validate(configuration());
    this.panel = panel;
    this.configuration = configuration;
    this.callback = callback;
    this.ngZone.runOutsideAngular(() => {
      this.subscription = fromEvent(panel, 'scroll')
        .pipe(debounce(() => timer(configuration().debounceTime)))
        .subscribe(() => this.check(this.optionCount, false));
    });
  }

  /**
   * Request a page when visible geometry is within the configured threshold.
   * Automatic checks need a changed layout/count; explicit scrolls can retry
   * after an empty or failed response without changing the rendered options.
   *
   * @param optionCount Current MatOption count, used to detect list growth.
   * @param automatic False for a scroll event; true for opening/input/option checks.
   */
  check(optionCount: number, automatic = true): void {
    this.optionCount = optionCount;
    const panel = this.panel;
    const config = this.configuration?.();
    if (!panel || !config || config.complete || config.loading || panel.clientHeight <= 0) return;
    const threshold = this.thresholdPixels(config.threshold, panel.scrollHeight);
    const remaining = panel.scrollHeight - panel.clientHeight - panel.scrollTop;
    // Browser layout can leave a fractional distance at the visual bottom.
    if (remaining > threshold + 0.5) return;

    // An automatic check can request again only after the rendered list changes.
    // A failed/empty page must not cause an unbounded automatic request loop.
    const key = `${panel.scrollHeight}:${panel.clientHeight}:${optionCount}`;
    if (automatic && key === this.lastRequestKey) return;
    this.lastRequestKey = key;
    if (this.callback) this.ngZone.run(this.callback);
  }

  /** Allow an unchanged panel to request again when a new dataset starts. */
  reset(): void {
    this.lastRequestKey = undefined;
  }

  /** Stop listening and discard pending debounce work and panel references. */
  disconnect(): void {
    // Unsubscribing discards pending debounce timers instead of flushing them.
    this.subscription?.unsubscribe();
    this.subscription = undefined;
    this.panel = undefined;
    this.configuration = undefined;
    this.callback = undefined;
    this.optionCount = 0;
    this.reset();
  }

  /** Convert the documented percentage/pixel syntax to a distance in panel pixels. */
  private thresholdPixels(value: string, height: number): number {
    const match = /^(\d+(?:\.\d+)?|\.\d+)(%|px)?$/.exec(String(value).trim());
    if (!match || !Number.isFinite(Number(match[1]))) {
      throw new RangeError('threshold must be a non-negative percentage or pixel distance');
    }
    const distance = Number(match[1]);
    if (match[2] === '%' && distance > 100)
      throw new RangeError('percentage threshold must not exceed 100%');
    return match[2] === '%' ? (height * distance) / 100 : distance;
  }
}
