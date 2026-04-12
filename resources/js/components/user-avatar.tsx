import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { storageUrl } from '@/lib/storage';
import { cn } from '@/lib/utils';

const sizeClass: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-16',
};

export function UserAvatar({
    user,
    size = 'md',
    previewUrl = null,
    className,
}: {
    user: {
        name: string;
        avatar?: string | null;
    };
    size?: 'sm' | 'md' | 'lg';
    /** Blob URL or absolute preview before upload */
    previewUrl?: string | null;
    className?: string;
}) {
    const getInitials = useInitials();
    const stored = storageUrl(user.avatar ?? null);
    const src = previewUrl ?? stored ?? undefined;

    return (
        <Avatar
            className={cn(
                'shrink-0 rounded-full border border-border/40',
                sizeClass[size],
                className,
            )}
        >
            <AvatarImage src={src} alt={user.name} className="object-cover" />
            <AvatarFallback className="rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {getInitials(user.name)}
            </AvatarFallback>
        </Avatar>
    );
}
