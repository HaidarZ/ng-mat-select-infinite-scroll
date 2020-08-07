
# Angular Material Select Infinite Scroll  
  
Adds missing infinite scroll functionality for the [angular material select component](https://material.angular.io/components/select)
  
  
### Inputs  
  
| Property       | Description                                                                                                                                                                                                                                                                                                              | Type      | Default    |  
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------| ---------- |  
| `complete`     | If `true`, the `infiniteScroll` output will no longer be triggered                                                                                                                                                                                                                                                        | `boolean` | `false`    |  
| `threshold`    | The threshold distance from the bottom of the options list to call the `infiniteScroll` output event when scrolled. The threshold value can be either in percent, or in pixels. For example, use the value of `10%` for the `infiniteScroll` output event to get called when the user has needs 10% to reach the bottom. | `string`  | `'15%'`    |
| `debounceTime` | The threshold time before firing the `infiniteScroll` event                                                                                                                                                                                                                                                              | `number`  | `150`      |
### Outputs
| Property         | Description                                                                             | Type                                                                                                                                                                                                                                                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------- | --------------------
| `infiniteScroll`  | Emitted when the scroller inside the `mat-select` reaches the required distance         | `EventEmitter<void>`

### Installation

```
npm i ng-mat-select-infinite-scroll
```

### Usage
[StackBlitz working example](https://stackblitz.com/edit/ng-mat-select-infinite-scroll)

Import `MatSelectInfiniteScrollModule` inside the app.module.ts
```typescript
import { MatFormFieldModule, MatSelectModule } from '@angular/material/select';
import {MatSelectInfiniteScrollModule} from 'ng-mat-select-infinite-scroll';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSelectInfiniteScrollModule
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

* `@angular/core`: `>=6.0.0 <11`,
* `@angular/cdk`: `>=6.0.0 <11`,
* `@angular/material`: `>=6.0.0 <11`,
* `rxjs`: `^6.0.0`

### Contributions
Contributions are welcomed, feel free to open a Pull-Request or open a new issue.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
