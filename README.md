
# Angular Material Select Infinite Scroll  
  
Adds missing infinite scroll functionality for the [angular material select component](https://material.angular.io/components/select)
  
  
### Inputs  
  
| Property    | Description                                                                                                                                                                                                                                                                                                              | Type                | Default    |  
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ---------- |  
| `complete`  | If `true`, the `infinitScroll` output will no longer be triggered                                                                                                                                                                                                                                                        | `boolean`           | `false`    |  
| `threshold` | The threshold distance from the bottom of the options list to call the `infiniteScroll` output event when scrolled. The threshold value can be either in percent, or in pixels. For example, use the value of `10%` for the `infiniteScroll` output event to get called when the user has needs 10% to reach the bottom. | `string`            | `'15%'`    |

### Outputs
| Property         | Description                                                                             | Type                                                                                                                                                                                                                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------| ------------ 
| `infinitScroll`  | Emitted when the scroller inside the `mat-select` reaches the required distance         | `EventEmitter<void>`


### Usage

Import `NgMatSelectInfiniteScrollModule` inside the app.module.ts
```typescript
import { MatFormFieldModule, MatSelectModule } from '@angular/material';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgMatSelectInfiniteScrollModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

Then place the msInfiniteScroll directive on the `mat-select` component
```html
  <mat-form-field appearance="outline">
    <mat-label>Select</mat-label>
    <mat-select msInfiniteScroll (infiniteScroll)="getNextBatch()" [complete]="offset === data.length">
      <mat-option *ngFor="let option of options$ | async" [value]="option">{{option}}</mat-option>
    </mat-select>
  </mat-form-field>
```

### Compatibility

* `@angular/core`: `^7.0.0`,
* `@angular/cdk`: `^7.0.0`,
* `@angular/material`: `^7.0.0`,
* `rxjs`: `^6.0.0`
