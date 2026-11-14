import { ChangeDetectionStrategy, Component, computed, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription, timer } from 'rxjs';
import { MatSelectInfiniteScrollDirective } from 'ng-mat-select-infinite-scroll';

@Component({
  selector: 'app-root', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatProgressBarModule, MatSelectInfiniteScrollDirective],
  templateUrl: './app.component.html', styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  private readonly catalog = Array.from({ length: 1000 }, (_, id) => ({ id, name: `Customer ${String(id + 1).padStart(4, '0')}` }));
  private request?: Subscription;
  readonly query = signal('');
  readonly options = signal<Array<{ id: number; name: string }>>([]);
  readonly selected = signal<number[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly failNext = signal(false);
  readonly requests = signal(0);
  readonly filtered = computed(() => this.catalog.filter(item => item.name.toLowerCase().includes(this.query().toLowerCase())));
  readonly complete = computed(() => this.options().length >= this.filtered().length);
  readonly retainedSelection = computed(() => this.catalog.filter(item => this.selected().includes(item.id) && !this.options().some(option => option.id === item.id)));

  constructor() { this.loadNextPage(); }

  search(query: string): void {
    this.request?.unsubscribe();
    this.query.set(query);
    this.options.set([]);
    this.loading.set(false);
    this.error.set(false);
    this.loadNextPage();
  }

  loadNextPage(): void {
    if (this.loading() || this.complete()) return;
    this.loading.set(true);
    this.error.set(false);
    this.requests.update(value => value + 1);
    const page = this.filtered().slice(this.options().length, this.options().length + 20);
    // Simulate network latency long enough to see the demo's loading state.
    this.request = timer(1000).subscribe(() => {
      if (this.failNext()) { this.failNext.set(false); this.error.set(true); }
      else this.options.update(options => [...options, ...page]);
      this.loading.set(false);
    });
  }

  ngOnDestroy(): void { this.request?.unsubscribe(); }
}
