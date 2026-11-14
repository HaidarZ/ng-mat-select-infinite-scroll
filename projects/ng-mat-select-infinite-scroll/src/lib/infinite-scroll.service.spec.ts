import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { InfiniteScrollService, ScrollConfiguration } from './infinite-scroll.service';

describe('InfiniteScrollService', () => {
  let service: InfiniteScrollService;
  let panel: HTMLElement;
  let config: ScrollConfiguration;
  let calls: number;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [InfiniteScrollService] });
    service = TestBed.inject(InfiniteScrollService);
    panel = document.createElement('div');
    Object.defineProperties(panel, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 1000 },
      scrollTop: { configurable: true, writable: true, value: 750 }
    });
    config = { threshold: '15%', debounceTime: 20, complete: false, loading: false };
    calls = 0;
    service.connect(panel, () => config, () => calls++);
  });

  afterEach(() => service.disconnect());

  it('uses percentage distance from the actual bottom', () => {
    panel.scrollTop = 749;
    service.check(20);
    expect(calls).toBe(0);
    panel.scrollTop = 750;
    service.check(20);
    expect(calls).toBe(1);
  });

  it('supports pixel thresholds and fractional layout measurements', () => {
    config.threshold = '10px';
    panel.scrollTop = 889;
    service.check(20);
    expect(calls).toBe(0);
    panel.scrollTop = 889.75;
    service.check(20);
    expect(calls).toBe(1);
  });

  it('suppresses requests while loading and checks again after growth', () => {
    config.loading = true;
    service.check(20);
    expect(calls).toBe(0);
    config.loading = false;
    service.check(20);
    expect(calls).toBe(1);
  });

  it('does not automatically retry an empty or failed page', fakeAsync(() => {
    service.check(20);
    expect(calls).toBe(1);
    config.loading = true;
    service.check(20);
    config.loading = false;
    service.check(20);
    service.check(20);
    expect(calls).toBe(1);
    panel.dispatchEvent(new Event('scroll'));
    tick(20);
    expect(calls).toBe(2); // A new user scroll can explicitly try again.
    service.check(20);
    expect(calls).toBe(2);
  }));

  it('allows bounded automatic filling when the option count changes', () => {
    Object.defineProperty(panel, 'scrollHeight', { configurable: true, value: 100 });
    panel.scrollTop = 0;
    service.check(2);
    service.check(2);
    expect(calls).toBe(1);
    service.check(4);
    expect(calls).toBe(2);
  });

  it('ignores hidden panels', () => {
    Object.defineProperty(panel, 'clientHeight', { configurable: true, value: 0 });
    service.check(20);
    expect(calls).toBe(0);
  });

  it('reads current completion state for a pending event', fakeAsync(() => {
    panel.dispatchEvent(new Event('scroll'));
    config.complete = true;
    tick(20);
    expect(calls).toBe(0);
  }));

  it('uses the latest debounce time for subsequent scroll events', fakeAsync(() => {
    panel.dispatchEvent(new Event('scroll'));
    tick(10);
    config.debounceTime = 5;
    panel.dispatchEvent(new Event('scroll'));
    tick(4);
    expect(calls).toBe(0);
    tick(1);
    expect(calls).toBe(1);
  }));

  it('discards timers and detaches the old panel on reconnect', fakeAsync(() => {
    panel.dispatchEvent(new Event('scroll'));
    const oldPanel = panel;
    panel = document.createElement('div');
    service.connect(panel, () => config, () => calls++);
    oldPanel.dispatchEvent(new Event('scroll'));
    tick(25);
    expect(calls).toBe(0);
  }));

  for (const threshold of ['-1px', 'wrong', '10foo', '101%', 'Infinity']) {
    it(`rejects invalid threshold ${threshold}`, () => {
      expect(() => service.validate({ ...config, threshold })).toThrowError(RangeError);
    });
  }

  it('rejects invalid debounce values', () => {
    for (const debounceTime of [-1, NaN, Infinity]) {
      expect(() => service.validate({ ...config, debounceTime })).toThrowError(RangeError);
    }
  });
});
