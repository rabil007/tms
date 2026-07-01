import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, Ban, Home, ServerCrash, Wrench } from 'lucide-react';
import AppLogoImage from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

type ErrorPageProps = {
    status: 403 | 404 | 500 | 503;
};

const errorContent: Record<
    ErrorPageProps['status'],
    { title: string; description: string; icon: typeof Ban }
> = {
    403: {
        title: '403 · Forbidden',
        description: 'You do not have permission to access this page.',
        icon: Ban,
    },
    404: {
        title: '404 · Page Not Found',
        description: 'The page you are looking for could not be found.',
        icon: AlertTriangle,
    },
    500: {
        title: '500 · Server Error',
        description:
            'Something went wrong on our servers. Please try again later.',
        icon: ServerCrash,
    },
    503: {
        title: '503 · Service Unavailable',
        description: 'We are doing some maintenance. Please check back soon.',
        icon: Wrench,
    },
};

export default function ErrorPage({ status }: ErrorPageProps) {
    const content = errorContent[status] ?? errorContent[500];
    const Icon = content.icon;

    return (
        <>
            <Head title={content.title} />

            <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background p-6 md:p-10">
                <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
                    <AppLogoImage className="h-16 w-auto sm:h-20" />

                    <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-border">
                        <Icon className="size-8" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {content.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {content.description}
                        </p>
                    </div>

                    <Button asChild>
                        <Link href={dashboard()}>
                            <Home />
                            Back to dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
