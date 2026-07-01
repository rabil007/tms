import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { edit as editApplication } from '@/routes/application';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editNotifications } from '@/routes/notifications';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { edit as editSmtp } from '@/routes/smtp';
import type { Auth } from '@/types/auth';
import type { NavItem } from '@/types';

const baseSettingsNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: null,
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: null,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: null,
    },
    {
        title: 'Notifications',
        href: editNotifications(),
        icon: null,
    },
    {
        title: 'Email',
        href: editSmtp(),
        icon: null,
    },
];

const applicationNavItem: NavItem = {
    title: 'Application',
    href: editApplication(),
    icon: null,
};

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAdmin = auth.user.role?.slug === 'admin';
    const settingsNavItems = isAdmin ? [...baseSettingsNavItems, applicationNavItem] : baseSettingsNavItems;

    return (
        <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:py-6">
            <Link
                href={dashboard()}
                className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-semibold text-muted-foreground transition-colors active:bg-muted/60 hover:bg-muted/50 hover:text-foreground"
            >
                <ArrowLeft className="size-4" />
                Dashboard
            </Link>

            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <nav
                className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
                aria-label="Settings"
            >
                {settingsNavItems.map((item, index) => (
                    <Button
                        key={`${toUrl(item.href)}-${index}`}
                        size="sm"
                        variant="ghost"
                        asChild
                        className={cn(
                            'h-11 shrink-0 rounded-full px-4 text-[13px] font-semibold',
                            {
                                'bg-muted text-foreground': isCurrentOrParentUrl(item.href),
                            },
                        )}
                    >
                        <Link href={item.href}>{item.title}</Link>
                    </Button>
                ))}
            </nav>

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="hidden w-48 lg:block">
                    <nav
                        className="flex flex-col space-y-1"
                        aria-label="Settings"
                    >
                        {settingsNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('h-11 w-full justify-start', {
                                    'bg-muted': isCurrentOrParentUrl(item.href),
                                })}
                            >
                                <Link href={item.href}>{item.title}</Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <div className="min-w-0 flex-1 lg:max-w-2xl">
                    <section className="space-y-8 sm:space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
