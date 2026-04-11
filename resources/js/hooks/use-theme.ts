import { useAppearance } from '@/hooks/use-appearance';

export type CarstoryTheme = 'light' | 'dark';

export function useTheme(): {
    theme: CarstoryTheme;
    toggleTheme: () => void;
    setTheme: (t: CarstoryTheme) => void;
} {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    return {
        theme: resolvedAppearance,
        toggleTheme: () =>
            updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark'),
        setTheme: (t) => updateAppearance(t),
    };
}
