import { NgModule } from '@angular/core';
import { MatSelectInfiniteScrollDirective } from './mat-select-infinite-scroll.directive';
import { MatSelectModule } from '@angular/material/select';

/** NgModule entry point. Standalone applications can import the directive directly. */
@NgModule({
  imports: [MatSelectModule, MatSelectInfiniteScrollDirective],
  exports: [MatSelectInfiniteScrollDirective],
})
export class MatSelectInfiniteScrollModule {}
