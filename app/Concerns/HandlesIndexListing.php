<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

trait HandlesIndexListing
{
    /**
     * @param  class-string<Model>  $modelClass
     * @param  list<string>  $sortableColumns
     * @param  list<string>  $searchableColumns
     * @return array{paginator: LengthAwarePaginator<int, Model>, filters: \stdClass}
     */
    protected function paginateIndexListing(
        Request $request,
        string $modelClass,
        array $sortableColumns,
        array $searchableColumns,
        ?string $defaultSort = null,
        int $defaultPerPage = 15,
    ): array {
        $resolvedDefaultSort = $defaultSort ?? $sortableColumns[0] ?? 'id';

        $sort = in_array($request->input('sort'), $sortableColumns, true)
            ? $request->input('sort')
            : $resolvedDefaultSort;

        $dir = $request->input('dir', 'asc') === 'desc' ? 'desc' : 'asc';

        /** @var Builder<Model> $query */
        $query = $modelClass::query();

        $paginator = $query
            ->when($request->q, function (Builder $query) use ($request, $searchableColumns): void {
                $search = '%'.$request->q.'%';

                $query->where(function (Builder $query) use ($search, $searchableColumns): void {
                    foreach ($searchableColumns as $index => $column) {
                        if ($index === 0) {
                            $query->where($column, 'like', $search);
                        } else {
                            $query->orWhere($column, 'like', $search);
                        }
                    }
                });
            })
            ->orderBy($sort, $dir)
            ->paginate($request->integer('per_page', $defaultPerPage))
            ->withQueryString();

        $filters = array_filter(
            $request->only(['q', 'sort', 'dir', 'per_page']),
            fn (mixed $value): bool => $value !== null && $value !== '',
        );

        return [
            'paginator' => $paginator,
            'filters' => (object) $filters,
        ];
    }
}
