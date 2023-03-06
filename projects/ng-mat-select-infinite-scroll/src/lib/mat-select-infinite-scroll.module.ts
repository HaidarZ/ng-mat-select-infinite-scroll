import {NgModule} from '@angular/core';
import {MatSelectInfiniteScrollDirective} from './mat-select-infinite-scroll.directive';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';

@NgModule({
  declarations: [MatSelectInfiniteScrollDirective],
  imports: [
    MatSelectModule
  ],
  exports: [MatSelectInfiniteScrollDirective]
})
export class MatSelectInfiniteScrollModule {
}
