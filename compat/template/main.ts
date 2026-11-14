import { Component, NgModule, inject, ChangeDetectorRef, ChangeDetectionStrategy, importProvidersFrom, ViewChild, VERSION /* CHANGE_DETECTION_IMPORTS */ } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSelectInfiniteScrollDirective, MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';

const template = `
  <h1>Paging consumer</h1>
  <p data-testid="angular">{{angularVersion}}</p>
  <mat-form-field>
    <mat-label>Options</mat-label>
    <mat-select msInfiniteScroll [value]="selected" (selectionChange)="selected = $event.value"
                [multiple]="multiple" [complete]="complete" [loading]="loading || paused"
                [threshold]="threshold" [debounceTime]="20" (infiniteScroll)="handleScroll()">
      <mat-optgroup label="Customer options">
        <mat-option *ngFor="let option of options" [value]="option">Option {{option}}</mat-option>
      </mat-optgroup>
    </mat-select>
  </mat-form-field>
  <p data-testid="count">{{options.length}}</p>
  <p data-testid="requests">{{requests}}</p>
  <p data-testid="emissions">{{emissions}}</p>
  <p data-testid="selection">{{selected}}</p>
  <p data-testid="error">{{error}}</p>
  <p data-testid="paused">{{paused}}</p>
  <button data-testid="complete" (click)="manualComplete = !manualComplete">Toggle complete</button>
  <button data-testid="pause" (click)="paused = !paused">Toggle loading</button>
  <button data-testid="fail" (click)="failNext = true">Fail next request</button>
  <button data-testid="retry" (click)="load()">Retry</button>
`;

class PagingState {
  constructor() { Object.assign(window, { consumer: this }); }
  readonly angularVersion = VERSION.full;
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly params = new URLSearchParams(location.search);
  readonly multiple = this.params.has('multiple');
  readonly total = Number(this.params.get('total') || 60);
  readonly pageSize = Number(this.params.get('page') || 20);
  readonly threshold = this.params.get('threshold') || '15%';
  options = Array.from({ length: Math.min(Number(this.params.get('initial') || 20), this.total) }, (_, i) => i);
  selected: number | number[] = this.multiple ? [0] : Number(this.params.get('selected') || 0);
  requests = 0;
  emissions = 0;
  loading = false;
  paused = false;
  manualComplete = false;
  failNext = false;
  error = false;

  get complete() { return this.manualComplete || this.options.length >= this.total; }

  handleScroll() { this.emissions++; this.load(); }

  load() {
    if (this.loading || this.complete) return;
    this.loading = true;
    this.error = false;
    this.requests++;
    setTimeout(() => {
      if (this.failNext) {
        this.failNext = false;
        this.error = true;
      } else {
        const start = this.options.length;
        this.options = [...this.options, ...Array.from({ length: Math.min(this.pageSize, this.total - start) }, (_, i) => start + i)];
      }
      this.loading = false;
      this.changeDetector.markForCheck();
    }, 80);
  }
}

@Component({ selector: 'app-root', standalone: false, changeDetection: ChangeDetectionStrategy.OnPush, template })
class ModuleAppComponent extends PagingState { @ViewChild(MatSelectInfiniteScrollDirective) directive?: MatSelectInfiniteScrollDirective; }

@Component({ selector: 'app-root', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, template,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatSelectInfiniteScrollDirective] })
class StandaloneAppComponent extends PagingState { @ViewChild(MatSelectInfiniteScrollDirective) directive?: MatSelectInfiniteScrollDirective; }

@NgModule({ declarations: [ModuleAppComponent], imports: [BrowserModule, BrowserAnimationsModule, MatFormFieldModule, MatSelectModule, MatSelectInfiniteScrollModule],
  providers: [/* CHANGE_DETECTION_PROVIDER */], bootstrap: [ModuleAppComponent] })
class AppModule {}

const bootstrap = new URLSearchParams(location.search).get('mode') === 'standalone'
  ? bootstrapApplication(StandaloneAppComponent, { providers: [importProvidersFrom(BrowserAnimationsModule) /* CHANGE_DETECTION_STANDALONE */] })
  : platformBrowserDynamic().bootstrapModule(AppModule);
bootstrap.catch(error => {
  document.body.setAttribute('data-bootstrap-error', String(error));
  console.error(error);
});
