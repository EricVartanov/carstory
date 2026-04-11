import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={toggleTheme}
            className={cn(
                'size-9 shrink-0 rounded-full bg-secondary transition-colors hover:bg-muted',
                className,
            )}
            aria-label={
                theme === 'dark'
                    ? 'Включить светлую тему'
                    : 'Включить тёмную тему'
            }
        >
            {theme === 'dark' ? (
                <Sun className="size-4" />
            ) : (
                <Moon className="size-4" />
            )}
        </Button>
    );
}
