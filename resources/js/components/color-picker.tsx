import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { CarColorOption } from '@/types/enums';

type ColorPickerProps = {
    value: string;
    onChange: (value: string) => void;
    colors: CarColorOption[];
};

export function ColorPicker({ value, onChange, colors }: ColorPickerProps) {
    const selected = colors.find((c) => c.id === value);
    const noneValue = '__none__';

    return (
        <Select
            value={value !== '' ? value : noneValue}
            onValueChange={(v) => onChange(v === noneValue ? '' : v)}
        >
            <SelectTrigger className="w-full">
                {selected ? (
                    <span className="flex items-center gap-2">
                        <span
                            className={cn(
                                'size-3.5 rounded-full',
                                selected.needsBorder && 'ring-1 ring-border',
                            )}
                            style={{ backgroundColor: selected.hex }}
                        />
                        <span>{selected.name}</span>
                    </span>
                ) : (
                    <span className="text-muted-foreground">Не выбран</span>
                )}
            </SelectTrigger>

            <SelectContent align="start">
                <SelectItem value={noneValue}>
                    <span className="text-muted-foreground">Не выбран</span>
                </SelectItem>

                {colors.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                            <span
                                className={cn(
                                    'size-3.5 rounded-full',
                                    c.needsBorder && 'ring-1 ring-border',
                                )}
                                style={{ backgroundColor: c.hex }}
                            />
                            <span>{c.name}</span>
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
