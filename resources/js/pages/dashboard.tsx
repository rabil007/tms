import { Head, usePage } from '@inertiajs/react';
import { CalendarClock, FolderKanban, Globe, LayoutDashboard, Settings } from 'lucide-react';
import { DashboardGrid, type DashboardModule } from '@/components/dashboard-grid';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

const modules: DashboardModule[] = [
    {
        id: 'home',
        name: 'Overview',
        icon: LayoutDashboard,
        color: 'from-slate-600 to-slate-700',
        href: '/dashboard',
    },
    {
        id: 'schedules',
        name: 'Schedules',
        icon: CalendarClock,
        color: 'from-emerald-500 to-teal-600',
        href: '/schedules',
    },
    {
        id: 'projects',
        name: 'Projects',
        icon: FolderKanban,
        color: 'from-violet-500 to-purple-600',
        href: '/projects',
    },
    {
        id: 'countries',
        name: 'Countries',
        icon: Globe,
        color: 'from-blue-500 to-indigo-600',
        href: '/countries',
    },
    {
        id: 'settings',
        name: 'Settings',
        icon: Settings,
        color: 'from-zinc-600 to-neutral-800',
        href: '/settings/profile',
    },
];

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;
    const storageKey = `dashboard:order:${auth.user?.id ?? 'guest'}`;

    return (
        <>
            <Head title="Dashboard" />
            <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-10">
                <DashboardGrid
                    modules={modules}
                    iconSize="lg"
                    storageKey={storageKey}
                />
            </div>
        </>
    );
}
