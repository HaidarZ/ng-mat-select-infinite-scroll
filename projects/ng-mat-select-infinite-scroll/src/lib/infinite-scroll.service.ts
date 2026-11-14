import { Injectable, NgZone } from '@angular/core';
import { debounce, fromEvent, Subscription, timer } from 'rxjs';

export interface ScrollConfiguration {
  threshold: string;
  debounceTime: number;
  complete: boolean;
  loading: boolean;
}

@Injectable()
export class InfiniteScrollService {
  private subscription?: Subscription;
  private panel?: HTMLElement;
  private configuration?: () => ScrollConfiguration;
  private callback?: () => void;
  private lastRequestKey?: string;
  private optionCount = 0;

  constructor(private readonly ngZone: NgZone) {}

  validate(config: ScrollConfiguration): void {
    this.thresholdPixels(config.threshold, 1);
    if (!Number.isFinite(config.debounceTime) || config.debounceTime < 0) {
      throw new RangeError('debounceTime must be a finite, non-negative number');
    }
  }

  connect(panel: HTMLElement, configuration: () => ScrollConfiguration, callback: () => void): void {
    this.disconnect();
    this.validate(configuration());
    this.panel = panel;
    this.configuration = configuration;
    this.callback = callback;
    this.ngZone.runOutsideAngular(() => {
      this.subscription = fromEvent(panel, 'scroll').pipe(
        debounce(() => timer(configuration().debounceTime))
      ).subscribe(() => this.check(this.optionCount, false));
    });
  }

  check(optionCount: number, automatic = true): void {
    this.optionCount = optionCount;
    const panel = this.panel;
    const config = this.configuration?.();
    if (!panel || !config || config.complete || config.loading || panel.clientHeight <= 0) return;
    const threshold = this.thresholdPixels(config.threshold, panel.scrollHeight);
    const remaining = panel.scrollHeight - panel.clientHeight - panel.scrollTop;
    if (remaining > threshold + 0.5) return;

    // An automatic check can request again only after the rendered list changes.
    // A failed/empty page must not cause an unbounded automatic request loop.
    const key = `${panel.scrollHeight}:${panel.clientHeight}:${optionCount}`;
    if (automatic && key === this.lastRequestKey) return;
    this.lastRequestKey = key;
    if (this.callback) this.ngZone.run(this.callback);
  }

  reset(): void {
    this.lastRequestKey = undefined;
  }

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

  private thresholdPixels(value: string, height: number): number {
    const match = /^(\d+(?:\.\d+)?|\.\d+)(%|px)?$/.exec(String(value).trim());
    if (!match || !Number.isFinite(Number(match[1]))) {
      throw new RangeError('threshold must be a non-negative percentage or pixel distance');
    }
    const distance = Number(match[1]);
    if (match[2] === '%' && distance > 100) throw new RangeError('percentage threshold must not exceed 100%');
    return match[2] === '%' ? height * distance / 100 : distance;
  }
}
