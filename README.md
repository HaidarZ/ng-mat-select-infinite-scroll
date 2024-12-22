
# Angular Material Select Infinite Scroll  

Adds missing infinite scroll functionality for the [Angular Material Select component](https://material.angular.io/components/select).  

### Inputs  

| Property       | Description                                                                                                                                                                                                                  | Type      | Default    |  
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------| ---------- |  
| `complete`     | If `true`, the `infiniteScroll` output will no longer be triggered.                                                                                                                                                          | `boolean` | `false`    |  
| `threshold`    | The threshold distance from the bottom of the options list to call the `infiniteScroll` output event when scrolled. The threshold value can be either in percent or pixels. For example, `10%` triggers the event 10% before the bottom. | `string`  | `'15%'`    |  
| `debounceTime` | The threshold time (in milliseconds) before firing the `infiniteScroll` event.                                                                                                                                               | `number`  | `150`      |  

### Outputs  

| Property         | Description                                                                             | Type                  |  
| ----------------- | --------------------------------------------------------------------------------------- | --------------------- |  
| `infiniteScroll`  | Emitted when the scroller inside the `mat-select` reaches the required distance.        | `EventEmitter<void>`  |  

### Installation  

```bash
npm i ng-mat-select-infinite-scroll
```

### Usage  

[StackBlitz working example](https://stackblitz.com/edit/ng-mat-select-infinite-scroll)  

Import `MatSelectInfiniteScrollModule` inside the `app.module.ts`:  
```typescript
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';

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
export class AppModule {}
```

Then, place the `msInfiniteScroll` directive on the `mat-select` component:  
```html
<mat-form-field appearance="outline">
  <mat-label>Select</mat-label>
  <mat-select msInfiniteScroll (infiniteScroll)="getNextBatch()" [complete]="offset === data.length">
    <mat-option *ngFor="let option of options$ | async" [value]="option">{{option}}</mat-option>
  </mat-select>
</mat-form-field>
```

> **Note:**  
> Update the `complete` property when the loaded data reaches the total available data to avoid unnecessary scroll triggers.  
> For older versions of Angular (<15), use version 4 of this library.

### Compatibility  

This library supports Angular 15 and higher.  
* `@angular/core`: `>=15.0.0 <16`  
* `@angular/cdk`: `>=15.0.0 <16`  
* `@angular/material`: `>=15.0.0 <16`  
* `rxjs`: `^7.0.0`  

### Contributions  

Contributions are welcome! Feel free to open a Pull Request or create a new issue.  

### Development Server  

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any source files.  

### Build  

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.  

### Running Unit Tests  

Run `ng test` to execute unit tests via [Karma](https://karma-runner.github.io).  

### License  

[MIT](LICENSE)  
