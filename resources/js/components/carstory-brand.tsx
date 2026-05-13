import type { ImgHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const CARSTORY_MARK_URL = '/images/carstory-mark.png';

type CarStoryMarkProps = Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    'src' | 'decoding'
> & {
    alt?: string;
};

/**
 * Знак CarStory (без текста). Используйте там, где название уже показано рядом типографикой.
 */
export function CarStoryMark({
    className,
    alt = 'CarStory',
    loading = 'lazy',
    ...props
}: CarStoryMarkProps): ReactNode {
    return (
        <img
            src={CARSTORY_MARK_URL}
            alt={alt}
            decoding="async"
            loading={loading}
            className={cn('h-auto max-h-10 w-auto object-contain', className)}
            {...props}
        />
    );
}

type CarStoryWordmarkProps = {
    className?: string;
    /** Светлый текст для тёмного фона (знак на чёрном и т.п.). */
    tone?: 'default' | 'onDark' | 'inherit';
};

/** Типографическое «CarStory» в фирменных цветах (для составного lockup). */
export function CarStoryWordmark({
    className,
    tone = 'default',
}: CarStoryWordmarkProps): ReactNode {
    const bodyClass =
        tone === 'onDark'
            ? 'text-zinc-100'
            : tone === 'inherit'
              ? 'text-inherit'
              : 'text-foreground';

    return (
        <span
            className={cn(
                'font-semibold italic tracking-tight',
                className,
            )}
        >
            <span className={bodyClass}>Ca</span>
            <span className="text-brand-blue">R</span>
            <span className={bodyClass}>Story</span>
        </span>
    );
}

type CarStoryLockupProps = {
    className?: string;
    /** Вертикально: знак над словом; в ряд — для компактных шапок. */
    layout?: 'stacked' | 'inline';
    imageClassName?: string;
    wordmarkTone?: 'default' | 'onDark' | 'inherit';
};

/**
 * Полный бренд-блок: знак + слово CarStory. Там, где отдельного названия на экране нет.
 */
export function CarStoryLockup({
    className,
    layout = 'stacked',
    imageClassName,
    wordmarkTone = 'default',
}: CarStoryLockupProps): ReactNode {
    const mark = (
        <CarStoryMark
            alt=""
            aria-hidden
            className={cn(
                layout === 'stacked' ? 'max-h-12 sm:max-h-14' : 'max-h-7 sm:max-h-8',
                imageClassName,
            )}
        />
    );

    const wordmark = (
        <CarStoryWordmark
            tone={wordmarkTone}
            className={layout === 'inline' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'}
        />
    );

    if (layout === 'inline') {
        return (
            <span
                className={cn(
                    'inline-flex items-center gap-2',
                    className,
                )}
            >
                {mark}
                {wordmark}
            </span>
        );
    }

    return (
        <span
            className={cn(
                'inline-flex flex-col items-center gap-1.5',
                className,
            )}
        >
            {mark}
            {wordmark}
        </span>
    );
}
