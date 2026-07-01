import { Head, usePage } from '@inertiajs/react';
import {
    CalendarClock,
    FolderKanban,
    Globe,
    LayoutDashboard,
    Settings,
    Shield,
    Users,
} from 'lucide-react';
import { AppOnboardingTips } from '@/components/app-onboarding-tips';
import { DashboardGrid } from '@/components/dashboard-grid';
import type { DashboardModule } from '@/components/dashboard-grid';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

const allModules: (DashboardModule & { adminOnly?: boolean })[] = [
    {
        id: 'home',
        name: 'Overview',
        icon: LayoutDashboard,
        color: 'from-slate-600 to-slate-700',
        href: '/overview',
    },
    {
        id: 'schedules',
        name: 'Schedules',
        icon: CalendarClock,
        color: 'from-emerald-500 to-teal-600',
        href: '/schedules',
    },
    {
        id: 'users',
        name: 'Users',
        icon: Users,
        color: 'from-cyan-500 to-blue-600',
        href: '/users',
        adminOnly: true,
    },
    {
        id: 'roles',
        name: 'Roles',
        icon: Shield,
        color: 'from-rose-500 to-pink-600',
        href: '/roles',
        adminOnly: true,
    },
    {
        id: 'projects',
        name: 'Projects',
        icon: FolderKanban,
        color: 'from-violet-500 to-purple-600',
        href: '/projects',
        adminOnly: true,
    },
    {
        id: 'countries',
        name: 'Countries',
        icon: Globe,
        color: 'from-blue-500 to-indigo-600',
        href: '/countries',
        adminOnly: true,
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
    const isAdmin = auth.user?.role?.slug === 'admin';
    const modules = allModules.filter((module) => !module.adminOnly || isAdmin);

    return (
        <>
            <Head title="Dashboard" />
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-10">
                <div className="w-full max-w-5xl">
                    <AppOnboardingTips />
                    <DashboardGrid
                        modules={modules}
                        iconSize="lg"
                        storageKey={storageKey}
                    />
                </div>
            </div>
        </>
    );
}
