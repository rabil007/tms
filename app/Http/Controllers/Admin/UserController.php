<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $sortableColumns = ['name', 'email'];
        $sort = in_array($request->input('sort'), $sortableColumns, true)
            ? $request->input('sort')
            : 'name';
        $dir = $request->input('dir', 'asc') === 'desc' ? 'desc' : 'asc';

        $users = User::query()
            ->with('role')
            ->whereKeyNot($request->user()->id)
            ->when($request->q, function (Builder $query) use ($request): void {
                $search = '%'.$request->q.'%';

                $query->where(function (Builder $query) use ($search): void {
                    $query->where('name', 'like', $search)
                        ->orWhere('email', 'like', $search)
                        ->orWhereHas('role', fn (Builder $query) => $query->where('name', 'like', $search));
                });
            })
            ->orderBy($sort, $dir)
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        $filters = array_filter(
            $request->only(['q', 'sort', 'dir', 'per_page']),
            fn (mixed $value): bool => $value !== null && $value !== '',
        );

        $manageableUsers = User::query()->whereKeyNot($request->user()->id);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => (object) $filters,
            'counts' => [
                'total' => (clone $manageableUsers)->count(),
                'admins' => (clone $manageableUsers)->whereHas('role', fn (Builder $query) => $query->where('slug', 'admin'))->count(),
                'users' => (clone $manageableUsers)->whereHas('role', fn (Builder $query) => $query->where('slug', 'user'))->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'roleOptions' => $this->roleOptions(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::query()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User created.')]);

        return to_route('users.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user): Response
    {
        $this->ensureNotCurrentUser($user);

        $user->load('role');

        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): Response
    {
        $this->ensureNotCurrentUser($user);

        $user->load('role');

        return Inertia::render('admin/users/edit', [
            'user' => $user,
            'roleOptions' => $this->roleOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->ensureNotCurrentUser($user);

        $validated = $request->validated();

        if (blank($validated['password'] ?? null)) {
            unset($validated['password']);
        }

        $user->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User updated.')]);

        return to_route('users.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $this->ensureNotCurrentUser($user);

        if ($user->isAdmin() && User::query()->where('role_id', $user->role_id)->count() <= 1) {
            return back()->withErrors(['user' => __('Cannot delete the last admin user.')]);
        }

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User deleted.')]);

        return to_route('users.index');
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    private function roleOptions(): array
    {
        return Role::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->all();
    }

    private function ensureNotCurrentUser(User $user): void
    {
        if ($user->id === auth()->id()) {
            abort(403);
        }
    }
}
