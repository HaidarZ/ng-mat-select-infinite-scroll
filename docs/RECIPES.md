# Request and selection recipes

## Share requests between selects

Issue #49 concerns several selects requesting the same page. Share an application data service, keyed by every parameter that affects the response:

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

Concurrent subscribers share one HTTP request. Completed responses are reused; failed requests are evicted for retry. When all consumers unsubscribe before completion, the shared request can be cancelled. Invalidate when the underlying dataset/context changes and add an eviction policy if query keys can grow indefinitely. Each select still owns its own offset, completion and loading state.

## Reset a query

Cancel the old subscription before resetting options/offset/completion, then request the new first page. With an observable search stream, `switchMap` can cancel the previous query and `exhaustMap` can prevent overlapping pages within that query. Retrying an error must keep the offset unchanged. Do not append an old query's late response to the new list.

The [demo component](../projects/example/src/app/app.component.ts) provides a runnable cancellation/reset/retry example using a delayed data source and signals. HTTP state remains outside the scroll directive.

## Keep selected values when replacing options

Maintain selected records separately from the current page, or fetch selected IDs from the server. Render retained selected options once, excluding IDs already present in the visible page. Keep stable option IDs; use `compareWith` for object values where appropriate, while remembering that it cannot recreate a missing option.

The [demo template](../projects/example/src/app/app.component.html) retains selected records across search resets. Its browser smoke test selects Customer 0001, searches for/selects Customer 1000, clears the query, and verifies that both selections remain available.
