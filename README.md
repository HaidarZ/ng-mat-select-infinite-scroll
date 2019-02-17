
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

Import `MatSelectInfiniteScrollModule` inside the app.module.ts
```typescript
import { MatFormFieldModule, MatSelectModule } from '@angular/material';
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

* `@angular/core`: `^7.0.0`,
* `@angular/cdk`: `^7.0.0`,
* `@angular/material`: `^7.0.0`,
* `rxjs`: `^6.0.0`

### Contributions
Contributions are welcomed, feel free to open a Pull-Request or open a new issue.

## Development

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.1.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
