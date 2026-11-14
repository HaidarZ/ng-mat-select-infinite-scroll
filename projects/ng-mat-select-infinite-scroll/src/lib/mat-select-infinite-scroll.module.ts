import {NgModule} from '@angular/core';
import {MatSelectInfiniteScrollDirective} from './mat-select-infinite-scroll.directive';
import {MatSelectModule} from '@angular/material/select';

@NgModule({
    imports: [
        MatSelectModule,
        MatSelectInfiniteScrollDirective,
    ],
    exports: [MatSelectInfiniteScrollDirective]
})
export class MatSelectInfiniteScrollModule {
}
