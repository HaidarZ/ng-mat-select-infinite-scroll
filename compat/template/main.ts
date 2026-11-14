import 'zone.js';
import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';

@Component({
  selector: 'v5-demo',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatSelectInfiniteScrollModule],
  template: `
    <main [attr.data-loaded]="options.length" [attr.data-requests]="requests"
          [attr.data-events]="events" [attr.data-complete]="complete">
      <h1>V5 compatibility</h1>
      <mat-form-field appearance="outline">
        <mat-label>Customer</mat-label>
        <mat-select msInfiniteScroll [complete]="complete" (infiniteScroll)="next()">
          <mat-option *ngFor="let option of options" [value]="option">Customer {{option}}</mat-option>
        </mat-select>
      </mat-form-field>
      <button (click)="completeSoon()">Complete while open</button>
    </main>
  `,
  styles: ['main { padding: 40px; font-family: sans-serif; } mat-form-field { width: 320px; }'],
})
class Demo {
  options: number[] = [];
  loading = false;
  complete = false;
  requests = 0;
  events = 0;

  constructor() {
    this.load();
  }

  next(): void {
    this.events++;
    this.load();
  }

  // V5 applications must guard their own requests: there is no loading input,
  // and complete changes are read when the panel opens.
  load(): void {
    if (this.loading || this.complete) return;
    this.loading = true;
    this.requests++;
    setTimeout(() => {
      const offset = this.options.length;
      this.options = [...this.options, ...Array.from({ length: 10 }, (_, i) => offset + i)];
      this.complete = this.options.length >= 50;
      this.loading = false;
    }, 50);
  }

  completeSoon(): void {
    setTimeout(() => (this.complete = true), 1000);
  }
}

@Component({ selector: 'app-root', template: '<v5-demo></v5-demo>' })
class ModuleHost {}
@NgModule({
  declarations: [ModuleHost],
  imports: [BrowserModule, BrowserAnimationsModule, Demo],
  bootstrap: [ModuleHost],
})
class AppModule {}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Demo],
  template: '<v5-demo></v5-demo>',
})
class StandaloneHost {}

if (new URLSearchParams(location.search).get('mode') === 'standalone') {
  bootstrapApplication(StandaloneHost, { providers: [provideAnimations()] }).catch((error) => {
    throw error;
  });
} else {
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((error) => {
      throw error;
    });
}
