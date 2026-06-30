import { router } from '@inertiajs/react';
import { ChevronRight, FolderKanban } from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { RowActions } from '@/components/list/row-actions';
import { ResourceTable } from '@/components/list/resource-table';
import type { Table } from '@tanstack/react-table';

export const PROJECT_ROUTES = {
    index: '/projects',
    create: '/projects/create',
    show: (id: number) => `/projects/${id}`,
    edit: (id: number) => `/projects/${id}/edit`,
    destroy: (id: number) => `/projects/${id}`,
} as const;

export type ProjectRow = { id: number; title: string };

type ProjectTableProps = {
    table: Table<ProjectRow>;
};

export function ProjectTable({ table }: ProjectTableProps) {
    return (
        <ResourceTable
            table={table}
            onRowClick={(project) => router.get(PROJECT_ROUTES.show(project.id))}
        />
    );
}

type ProjectCardsProps = {
    projects: ProjectRow[];
    onDelete: (project: ProjectRow) => () => Promise<void>;
};

function ProjectIcon({ title }: { title: string }) {
    const initials = title.slice(0, 2).toUpperCase();

    return (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500/15 to-purple-600/15 text-sm font-bold text-primary ring-1 ring-white/10">
            {initials}
        </div>
    );
}

export function ProjectListCards({ projects, onDelete }: ProjectCardsProps) {
    return (
        <div className="space-y-3">
            {projects.map((project) => (
                <GlassCard
                    key={project.id}
                    className="group cursor-pointer p-4 transition-all active:scale-[0.99] hover:border-primary/25 hover:bg-card/60"
                    onClick={() => router.get(PROJECT_ROUTES.show(project.id))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            router.get(PROJECT_ROUTES.show(project.id));
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <div className="flex items-center gap-3.5">
                        <ProjectIcon title={project.title} />
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-foreground">{project.title}</p>
                        </div>
                        <ChevronRight className="size-5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
                    </div>
                    <div className="mt-4 flex justify-end border-t border-border/30 pt-3">
                        <RowActions
                            showUrl={PROJECT_ROUTES.show(project.id)}
                            editUrl={PROJECT_ROUTES.edit(project.id)}
                            onDelete={onDelete(project)}
                            showLabel="View project"
                            editLabel="Edit project"
                            deleteLabel="Delete project"
                        />
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}

export function ProjectGridCards({ projects, onDelete }: ProjectCardsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {projects.map((project) => (
                <GlassCard
                    key={project.id}
                    className="group flex cursor-pointer flex-col p-4 transition-all active:scale-[0.99] hover:border-primary/25 hover:bg-card/60"
                    onClick={() => router.get(PROJECT_ROUTES.show(project.id))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            router.get(PROJECT_ROUTES.show(project.id));
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <ProjectIcon title={project.title} />
                    <p className="mt-3 line-clamp-2 font-semibold text-foreground">{project.title}</p>
                    <div className="mt-auto flex justify-end border-t border-border/30 pt-3">
                        <RowActions
                            showUrl={PROJECT_ROUTES.show(project.id)}
                            editUrl={PROJECT_ROUTES.edit(project.id)}
                            onDelete={onDelete(project)}
                            showLabel="View project"
                            editLabel="Edit project"
                            deleteLabel="Delete project"
                        />
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}