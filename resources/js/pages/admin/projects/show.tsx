import { Head, Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import React from 'react';
import { GlassCard } from '@/components/layout/glass-card';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { Button } from '@/components/ui/button';

const ROUTES = {
    index: '/projects',
    edit: (id: number) => `/projects/${id}/edit`,
} as const;

type Project = { id: number; title: string };

type DetailRowProps = { label: string; value: string };

function DetailRow({ label, value }: DetailRowProps) {
    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <dt className="shrink-0 text-[13px] font-semibold text-muted-foreground">
                {label}
            </dt>
            <dd className="text-[15px] font-medium text-foreground sm:text-right">
                {value}
            </dd>
        </div>
    );
}

export default function ProjectsShow({ project }: { project: Project }) {
    return (
        <ModulePageLayout backHref={ROUTES.index} backLabel="Projects">
            <Head title={project.title} />

            <div className="mx-auto w-full max-w-2xl">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        {project.title}
                    </h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                        Project details.
                    </p>
                </div>

                <GlassCard>
                    <dl className="divide-y divide-border/40 px-5 py-1 sm:px-8">
                        <div className="py-4">
                            <DetailRow
                                label="Project title"
                                value={project.title}
                            />
                        </div>
                    </dl>
                </GlassCard>

                <div className="mt-6 flex flex-col gap-3 border-t border-border/40 pt-6 sm:flex-row sm:justify-end">
                    <Button
                        variant="outline"
                        asChild
                        className="h-12 w-full rounded-xl border-border/60 bg-background/50 text-[14px] font-semibold sm:w-auto"
                    >
                        <Link href={ROUTES.index}>Back to list</Link>
                    </Button>
                    <Button
                        asChild
                        className="h-12 w-full rounded-xl px-8 text-[14px] font-semibold shadow-lg shadow-primary/20 sm:w-auto"
                    >
                        <Link href={ROUTES.edit(project.id)}>
                            <Pencil className="size-4" />
                            Edit Project
                        </Link>
                    </Button>
                </div>
            </div>
        </ModulePageLayout>
    );
}
