import { Link, usePage } from '@inertiajs/react';
import { Car, User } from 'lucide-react';
import { UserAvatar } from '@/components/user-avatar';
import { cn } from '@/lib/utils';
import { index as garageIndex } from '@/routes/garage';
import { edit as profileEdit } from '@/routes/profile';

type NavEntry = {
    label: string;
    href: ReturnType<typeof garageIndex>;
    icon: typeof Car;
    match: (pathname: string) => boolean;
};

const items: NavEntry[] = [
    {
        label: 'Гараж',
        href: garageIndex(),
        icon: Car,
        match: (pathname) =>
            pathname === '/garage' || pathname.startsWith('/garage/'),
    },
    {
        label: 'Профиль',
        href: profileEdit(),
        icon: User,
        match: (pathname) => pathname.startsWith('/settings/profile'),
    },
];

export function BottomNav() {
    const { url, props } = usePage<{ auth: { user: { name: string; avatar?: string | null } } }>();
    const authUser = props.auth?.user;
    const pathname = new URL(
        url,
        typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost',
    ).pathname;

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
            aria-label="Основная навигация"
        >
            <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2 pt-1">
                {items.map(({ label, href, icon: Icon, match }) => {
                    const active = match(pathname);
                    const showAvatar = label === 'Профиль' && authUser;

                    return (
                        <Link
                            key={label}
                            href={href}
                            prefetch
                            className={cn(
                                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-xs font-medium transition-colors',
                                active
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {showAvatar ? (
                                <UserAvatar
                                    user={authUser}
                                    size="sm"
                                    className={cn(
                                        'border-0',
                                        active
                                            ? 'ring-2 ring-primary ring-offset-1 ring-offset-card'
                                            : 'opacity-90',
                                    )}
                                />
                            ) : (
                                <Icon
                                    className={cn(
                                        'size-6 shrink-0',
                                        active
                                            ? 'text-primary'
                                            : 'text-muted-foreground',
                                    )}
                                    strokeWidth={active ? 2.25 : 2}
                                />
                            )}
                            <span className="truncate">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
