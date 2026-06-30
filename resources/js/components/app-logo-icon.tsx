import { cn } from '@/lib/utils';

type AppLogoImageProps = {
    className?: string;
    alt?: string;
};

export default function AppLogoImage({ className, alt = 'Overseas' }: AppLogoImageProps) {
    return (
        <img
            src="/logo.png"
            alt={alt}
            className={cn('h-auto w-auto max-w-full object-contain', className)}
        />
    );
}
