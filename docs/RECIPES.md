# Paging and selection

## Share requests between selects

Use a shared service to cache pages and avoid duplicate HTTP requests. Include every query parameter in the cache key:

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';

interface Page { items: Array<{ id: number; name: string }>; total: number; }

@Injectable({ providedIn: 'root' })
export class Customers {
  private readonly pages = new Map<string, Observable<Page>>();
  constructor(private readonly http: HttpClient) {}

  page(query: string, offset: number, limit = 20): Observable<Page> {
    const key = JSON.stringify([query, offset, limit]);
    let request = this.pages.get(key);
    if (!request) {
      request = this.http.get<Page>('/api/customers', { params: { query, offset, limit } }).pipe(
        catchError(error => { this.pages.delete(key); return throwError(() => error); }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
      this.pages.set(key, request);
    }
    return request;
  }

  invalidate(): void { this.pages.clear(); }
}
```

Subscribers share one request. Completed responses stay cached; failed requests can be retried. The request is cancelled if every subscriber leaves before it completes. Clear the cache when data or filters change, and limit its size for open-ended searches. Each select tracks its own offset, completion, and loading state.

## Reset a query

Cancel the previous request, reset options, offset, and completion, then fetch the first page. With observables, use `switchMap` for query changes and `exhaustMap` to avoid overlapping page requests. Keep the offset unchanged after an error.

See the [demo component](../projects/example/src/app/app.component.ts) for cancellation, reset, and retry handling.

## Keep selected values when replacing options

Keep selected records separately from the current page, or fetch them by ID. Render each selected option once, excluding records already in the page. `compareWith` can compare object values, but it cannot restore an option that has been removed.

The [demo template](../projects/example/src/app/app.component.html) retains selected options across searches.

## Limitations

### Keyboard navigation

Material can reset the active keyboard option to the selected option when pages append. The selected value and scroll position are preserved. This behavior is tracked in [#6](https://github.com/HaidarZ/ng-mat-select-infinite-scroll/issues/6) and [#17](https://github.com/HaidarZ/ng-mat-select-infinite-scroll/issues/17).

### Scroll containers and legacy components

Keep the Material select panel as the scrolling container. Options and optgroups are supported; independently scrolling nested elements are not.

Use `MatSelectModule`, not `MatLegacySelectModule`. When upgrading from Material 14, complete Material's MDC migration with `ng generate @angular/material:mdc-migration`.
