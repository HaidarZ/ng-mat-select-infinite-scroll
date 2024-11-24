import {NgModule} from '@angular/core';
import {MatSelectInfiniteScrollDirective} from './mat-select-infinite-scroll.directive';
import {MatSelectModule} from '@angular/material/select';

@NgModule({
    declarations: [MatSelectInfiniteScrollDirective],
    imports: [
        MatSelectModule,
    ],
    exports: [MatSelectInfiniteScrollDirective]
})
export class MatSelectInfiniteScrollModule {
}
