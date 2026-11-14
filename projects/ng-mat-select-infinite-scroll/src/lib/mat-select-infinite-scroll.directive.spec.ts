import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSelectInfiniteScrollModule } from './mat-select-infinite-scroll.module';

@Component({
  template: `
  <mat-select msInfiniteScroll [complete]="complete" [loading]="loading" [threshold]="threshold"
              [debounceTime]="20" (infiniteScroll)="calls = calls + 1">
    <mat-option *ngFor="let option of options" [value]="option">{{option}}</mat-option>
  </mat-select>`,
})
class HostComponent {
  complete = false;
  loading = false;
  threshold = '15%';
  calls = 0;
  options = Array.from({ length: 20 }, (_, i) => i);
}

describe('MatSelectInfiniteScrollDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let select: MatSelect;
  let panel: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, MatSelectModule, MatSelectInfiniteScrollModule, NoopAnimationsModule],
      declarations: [HostComponent],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    select = fixture.debugElement.query(By.directive(MatSelect)).componentInstance;
  });

  /** Use fixed panel measurements so these checks do not depend on Material CSS. */
  function open() {
    select.open();
    fixture.detectChanges();
    tick();
    panel = select.panel.nativeElement;
    Object.defineProperties(panel, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 1000 },
      scrollTop: { configurable: true, writable: true, value: 900 },
    });
    fixture.componentInstance.calls = 0;
  }

  it('emits near the bottom after the debounce', fakeAsync(() => {
    open();
    panel.dispatchEvent(new Event('scroll'));
    tick(19);
    expect(fixture.componentInstance.calls).toBe(0);
    tick(1);
    expect(fixture.componentInstance.calls).toBe(1);
  }));

  it('honors complete changes while open', fakeAsync(() => {
    open();
    fixture.componentInstance.complete = true;
    fixture.detectChanges();
    panel.dispatchEvent(new Event('scroll'));
    tick(25);
    expect(fixture.componentInstance.calls).toBe(0);
  }));

  it('honors loading changes and resumes after loading', fakeAsync(() => {
    open();
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    panel.dispatchEvent(new Event('scroll'));
    tick(25);
    expect(fixture.componentInstance.calls).toBe(0);
    fixture.componentInstance.loading = false;
    fixture.detectChanges();
    tick();
    expect(fixture.componentInstance.calls).toBe(1);
  }));

  it('honors threshold changes while open', fakeAsync(() => {
    open();
    panel.scrollTop = 890;
    fixture.componentInstance.threshold = '0px';
    fixture.detectChanges();
    panel.dispatchEvent(new Event('scroll'));
    tick(25);
    expect(fixture.componentInstance.calls).toBe(0);
    fixture.componentInstance.threshold = '10px';
    fixture.detectChanges();
    tick();
    expect(fixture.componentInstance.calls).toBe(1);
  }));

  it('cancels initialization when immediately closed', fakeAsync(() => {
    select.open();
    fixture.detectChanges();
    select.close();
    fixture.detectChanges();
    tick(50);
    expect(fixture.componentInstance.calls).toBe(0);
  }));

  it('discards a pending scroll when closed', fakeAsync(() => {
    open();
    panel.dispatchEvent(new Event('scroll'));
    select.close();
    fixture.detectChanges();
    tick(25);
    expect(fixture.componentInstance.calls).toBe(0);
  }));

  it('discards a pending scroll when destroyed', fakeAsync(() => {
    open();
    panel.dispatchEvent(new Event('scroll'));
    fixture.destroy();
    tick(25);
    expect(fixture.componentInstance.calls).toBe(0);
  }));

  it('does not listen to a panel after closing it', fakeAsync(() => {
    open();
    const previousPanel = panel;
    select.close();
    fixture.detectChanges();
    tick();
    previousPanel.dispatchEvent(new Event('scroll'));
    tick(25);
    expect(fixture.componentInstance.calls).toBe(0);
  }));

  it('uses the actual scroll height at a zero-pixel threshold', fakeAsync(() => {
    fixture.componentInstance.threshold = '0px';
    fixture.detectChanges();
    open();
    panel.dispatchEvent(new Event('scroll'));
    tick(25);
    expect(fixture.componentInstance.calls).toBe(1);
  }));

  it('does not override an application scroll reset when options are replaced', fakeAsync(() => {
    open();
    fixture.componentInstance.options = Array.from({ length: 30 }, (_, i) => i + 100);
    fixture.detectChanges();
    panel.scrollTop = 0;
    tick();
    expect(panel.scrollTop).toBe(0);
  }));

  it('checks a same-count replacement without toggling completion', fakeAsync(() => {
    open();
    Object.defineProperty(panel, 'scrollHeight', { configurable: true, value: 100 });
    panel.scrollTop = 0;
    panel.dispatchEvent(new Event('scroll'));
    tick(25);
    expect(fixture.componentInstance.calls).toBe(1);

    fixture.componentInstance.loading = true;
    fixture.componentInstance.options = Array.from({ length: 20 }, (_, i) => i + 100);
    fixture.detectChanges();
    tick();
    expect(fixture.componentInstance.calls).toBe(1);
    fixture.componentInstance.loading = false;
    fixture.detectChanges();
    tick();
    expect(fixture.componentInstance.calls).toBe(2);
    expect(fixture.componentInstance.complete).toBe(false);
  }));

  it('does not automatically retry when a request leaves the options unchanged', fakeAsync(() => {
    open();
    panel.dispatchEvent(new Event('scroll'));
    tick(25);
    expect(fixture.componentInstance.calls).toBe(1);

    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    tick();
    fixture.componentInstance.loading = false;
    fixture.detectChanges();
    tick();
    expect(fixture.componentInstance.calls).toBe(1);
  }));

  it('discards a pending append anchor when the options are replaced', fakeAsync(() => {
    open();
    fixture.componentInstance.options = Array.from({ length: 30 }, (_, i) => i);
    fixture.detectChanges();
    fixture.componentInstance.options = Array.from({ length: 30 }, (_, i) => i + 100);
    fixture.detectChanges();
    panel.scrollTop = 0;
    tick();
    expect(panel.scrollTop).toBe(0);
  }));
});
