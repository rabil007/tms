# Module Clone Checklist

Use this guide to add a new CRUD module by cloning the **Countries** reference module.

## Reuse (import, do not copy)

### Hooks
- `resources/js/hooks/use-index-query-params.ts` — search, sort, pagination
- `resources/js/hooks/use-index-view-mode.ts` — list/grid toggle + localStorage
- `resources/js/hooks/use-confirm-dialog.tsx` — delete confirmation
- `resources/js/hooks/use-mobile.tsx` — responsive breakpoint

### List components
- `resources/js/components/list/list-search.tsx`
- `resources/js/components/list/pagination-bar.tsx`
- `resources/js/components/list/rows-per-page-select.tsx`
- `resources/js/components/list/view-mode-toggle.tsx`
- `resources/js/components/list/sortable-header.tsx`
- `resources/js/components/list/empty-state.tsx`
- `resources/js/components/list/row-actions.tsx`
- `resources/js/components/list/index-toolbar.tsx`
- `resources/js/components/list/resource-table.tsx`

### Layout & forms
- `resources/js/components/layout/module-page-layout.tsx`
- `resources/js/components/layout/section-header.tsx`
- `resources/js/components/layout/glass-card.tsx`
- `resources/js/components/forms/form-page.tsx`

### Backend
- `app/Concerns/HandlesIndexListing.php` — index search/sort/paginate in controllers

---

## Clone & customize

Replace `{module}` / `{Module}` / `{modules}` with your resource name (e.g. `vessel`, `Vessel`, `vessels`).

### Backend

1. **Model + migration + factory**
   ```bash
   php artisan make:model {Module} -mf
   ```

2. **Controller** — copy `app/Http/Controllers/Admin/CountryController.php` → `{Module}Controller.php`
   - Use `HandlesIndexListing` trait in `index()`
   - Update model, sortable/searchable columns, Inertia page path, flash messages

3. **Form requests** — copy `StoreCountryRequest` / `UpdateCountryRequest` and validation concern

4. **Route** — add to `routes/web.php`:
   ```php
   Route::resource('{modules}', {Module}Controller::class);
   ```

5. **Tests** — copy `tests/Feature/CountryTest.php` → `{Module}Test.php`

6. **Seeder** (optional) — copy `database/seeders/CountrySeeder.php`

### Frontend

1. **Copy folder**
   ```bash
   cp -R resources/js/pages/admin/countries resources/js/pages/admin/{modules}
   ```

2. **Rename files**
   - `country-form.tsx` → `{module}-form.tsx`
   - `country-views.tsx` → `{module}-views.tsx`

3. **Update in each file**
   - Routes: `/countries` → `/{modules}`
   - Labels, icons, form fields, table columns, card content
   - `storageKey` in index: `'{modules}:index:view'`
   - Inertia paths in controller: `admin/{modules}/...`

4. **Dashboard tile** — add entry in `resources/js/pages/dashboard.tsx`

5. **Run Wayfinder** (if using generated routes):
   ```bash
   php artisan wayfinder:generate
   ```

---

## Index page template

A typical index page only needs:

- Column definitions (module-specific)
- `{module}-views.tsx` for list/grid card layouts
- Config passed to shared components:

```tsx
const { viewMode, setViewMode } = useIndexViewMode({ storageKey: '{modules}:index:view' });
const { q, setQ, perPage, setPerPage, sort, dir, toggleSort } = useIndexQueryParams({ ... });

<IndexToolbar search={q} onSearchChange={setQ} viewMode={viewMode} onViewModeChange={setViewMode} />
<ResourceTable table={table} onRowClick={(row) => router.get(routes.show(row.id))} />
<RowActions showUrl={...} editUrl={...} onDelete={...} />
<EmptyState icon={Icon} title="..." description="..." action={...} />
```

---

## Controller index template

```php
use App\Concerns\HandlesIndexListing;

class {Module}Controller extends Controller
{
    use HandlesIndexListing;

    public function index(Request $request): Response
    {
        ['paginator' => $items, 'filters' => $filters] = $this->paginateIndexListing(
            $request,
            {Module}::class,
            ['name', '...'],  // sortable
            ['name', '...'],  // searchable
        );

        return Inertia::render('admin/{modules}/index', [
            '{modules}' => $items,
            'filters' => $filters,
        ]);
    }
}
```

---

## Verify

```bash
php artisan test --compact --filter={Module}
npm run types:check
vendor/bin/pint --dirty
```
