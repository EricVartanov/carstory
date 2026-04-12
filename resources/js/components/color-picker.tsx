import { motion } from 'framer-motion';
import { CAR_COLORS, carColorNeedsBorder } from '@/lib/car-colors';
import { cn } from '@/lib/utils';

type ColorPickerProps = {
    value: string;
    onChange: (value: string) => void;
};

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    const selected = CAR_COLORS.find((c) => c.id === value);

    return (
        <div className="grid gap-3">
            <div className="grid grid-cols-6 gap-3">
                {CAR_COLORS.map((c) => {
                    const isSelected = c.id === value;
                    const needsBorder = carColorNeedsBorder(c.id);

                    return (
                        <motion.button
                            key={c.id}
                            type="button"
                            title={c.name}
                            layout
                            onClick={() =>
                                onChange(isSelected ? '' : c.id)
                            }
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full cursor-pointer transition-transform outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                needsBorder && 'border border-border/60',
                                isSelected &&
                                    'ring-2 ring-primary ring-offset-2 ring-offset-background',
                            )}
                            style={{ backgroundColor: c.hex }}
                            aria-label={c.name}
                            aria-pressed={isSelected}
                        >
                            {isSelected ? (
                                <motion.span
                                    layoutId="color-picker-pulse"
                                    className="absolute inset-0 rounded-full ring-2 ring-primary/40"
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 1.15, 1] }}
                                    transition={{
                                        duration: 0.45,
                                        ease: 'easeInOut',
                                    }}
                                />
                            ) : null}
                        </motion.button>
                    );
                })}
            </div>
            <p className="min-h-4 text-center text-xs text-muted-foreground">
                {selected ? selected.name : 'Не выбран'}
            </p>
        </div>
    );
}
