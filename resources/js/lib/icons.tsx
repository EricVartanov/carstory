import { Car, Camera, FileText, Fuel, Wrench } from 'lucide-react';

const ICON_MAP = { FileText, Wrench, Car, Fuel, Camera } as const;

export function DynamicIcon({
    name,
    className,
}: {
    name: string;
    className?: string;
}) {
    const Icon = ICON_MAP[name as keyof typeof ICON_MAP] ?? FileText;

    return <Icon className={className} />;
}

