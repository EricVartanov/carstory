import { Head, Link, router, usePage } from '@inertiajs/react';
import { Car, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { CardMotion } from '@/components/card-motion';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogBody,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { storageUrl } from '@/lib/storage';
import { cn, toUrl } from '@/lib/utils';
import {
    create,
    destroyPermanent,
    show,
    unarchive,
} from '@/routes/garage';
import type { CarColorOption, SharedEnums } from '@/types/enums';

type Car = {
    id: number;
    brand: string;
    model: string;
    car_generation_id?: number | null;
    generation?: { id: number; name: string; period: string } | null;
    year: number;
    vin: string | null;
    plate: string | null;
    color: string | null;
    cover_photo: string | null;
    created_at: string;
    archived_at?: string | null;
    entries?: unknown[];
};

type PreviousCar = {
    car: Car;
    owned_from: string;
    owned_until: string;
};

function CarCardMedia({ car }: { car: Car }) {
    const src = storageUrl(car.cover_photo);

    return (
        <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-t-lg bg-muted">
            {src ? (
                <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-800 to-slate-900">
                    <Car
                        className="size-8 text-slate-400"
                        strokeWidth={1.25}
                    />
                </div>
            )}
        </div>
    );
}

function yearAndPlate(car: Car): string {
    const bits = [String(car.year)];

    if (car.plate) {
        bits.push(car.plate);
    }

    return bits.join(' · ');
}

export default function GarageIndex({
    cars,
    archivedCars = [],
    previousCars = [],
}: {
    cars: Car[];
    archivedCars?: Car[];
    previousCars?: PreviousCar[];
}) {
    const [archiveOpen, setArchiveOpen] = useState(archivedCars.length > 0);
    const [deleteTarget, setDeleteTarget] = useState<Car | null>(null);
    const { enums } = usePage<{ enums: SharedEnums }>().props;

    function getColorOption(id: string | null): CarColorOption | undefined {
        if (!id) {
            return undefined;
        }

        return enums.carColors.find((c) => c.id === id);
    }

    return (
        <>
            <Head title="Гараж" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-lg font-semibold">Гараж</h1>
                    <Button asChild>
                        <Link href={create()}>Добавить</Link>
                    </Button>
                </div>

                {cars.length === 0 ? (
                    <div className="rounded-md border p-4 text-sm text-muted-foreground">
                        Пока нет машин.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {cars.map((car, index) => (
                            <CardMotion
                                key={car.id}
                                delay={index * 0.05}
                                className="block h-full min-w-0"
                            >
                                <Link href={show(car.id)} className="block h-full">
                                    <Card className="h-full gap-0 overflow-hidden py-0 transition-colors hover:bg-muted/50">
                                        <CarCardMedia car={car} />
                                        <CardHeader className="gap-1 p-3">
                                            <CardTitle className="text-sm font-medium leading-snug">
                                                {car.brand} {car.model}
                                            </CardTitle>
                                            {car.generation?.name ? (
                                                <p className="text-xs text-muted-foreground">
                                                    {car.generation.name}
                                                </p>
                                            ) : null}
                                            <p className="text-xs text-muted-foreground">
                                                {yearAndPlate(car)}
                                            </p>
                                            {car.color ? (
                                                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    {(() => {
                                                        const option =
                                                            getColorOption(
                                                                car.color,
                                                            );

                                                        return (
                                                            <>
                                                                <span
                                                                    className="inline-block size-3 shrink-0 rounded-full border border-border/50"
                                                                    style={{
                                                                        background:
                                                                            option?.hex ??
                                                                            'transparent',
                                                                    }}
                                                                    aria-hidden
                                                                />
                                                                <span>
                                                                    {option?.name ??
                                                                        car.color}
                                                                </span>
                                                            </>
                                                        );
                                                    })()}
                                                </p>
                                            ) : null}
                                        </CardHeader>
                                    </Card>
                                </Link>
                            </CardMotion>
                        ))}
                    </div>
                )}

                {previousCars.length > 0 ? (
                    <section className="flex flex-col gap-3 pt-2">
                        <h2 className="text-base font-semibold text-muted-foreground">
                            Проданные автомобили
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {previousCars.map((item, index) => (
                                <CardMotion
                                    key={`${item.car.id}-${item.owned_until}`}
                                    delay={index * 0.05}
                                    className="block h-full min-w-0"
                                >
                                    <Link
                                        href={show(item.car.id)}
                                        className="block h-full"
                                    >
                                        <Card className="h-full gap-0 overflow-hidden border-muted bg-muted/20 py-0 opacity-70 grayscale transition-all hover:opacity-90 hover:grayscale-0">
                                            <CarCardMedia car={item.car} />
                                            <CardHeader className="p-3">
                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1 space-y-1">
                                                        <CardTitle className="text-sm font-medium leading-snug">
                                                            {item.car.brand}{' '}
                                                            {item.car.model}
                                                        </CardTitle>
                                                        <p className="text-xs text-muted-foreground">
                                                            {yearAndPlate(
                                                                item.car,
                                                            )}
                                                        </p>
                                                        {item.car.generation?.name ? (
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    item.car
                                                                        .generation
                                                                        .name
                                                                }
                                                            </p>
                                                        ) : null}
                                                        {item.car.color ? (
                                                            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                {(() => {
                                                                    const option =
                                                                        getColorOption(
                                                                            item
                                                                                .car
                                                                                .color,
                                                                        );

                                                                    return (
                                                                        <>
                                                                            <span
                                                                                className="inline-block size-3 shrink-0 rounded-full border border-border/50"
                                                                                style={{
                                                                                    background:
                                                                                        option?.hex ??
                                                                                        'transparent',
                                                                                }}
                                                                                aria-hidden
                                                                            />
                                                                            <span>
                                                                                {option?.name ??
                                                                                    item
                                                                                        .car
                                                                                        .color}
                                                                            </span>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </p>
                                                        ) : null}
                                                        <p className="mt-2 text-sm text-muted-foreground">
                                                            Владел с{' '}
                                                            {item.owned_from} по{' '}
                                                            {item.owned_until}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className="shrink-0 border-destructive/40 bg-destructive/10 text-destructive"
                                                    >
                                                        Продан
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                </CardMotion>
                            ))}
                        </div>
                    </section>
                ) : null}

                {archivedCars.length > 0 ? (
                    <Collapsible
                        open={archiveOpen}
                        onOpenChange={setArchiveOpen}
                        className="flex flex-col gap-3 pt-2"
                    >
                        <CollapsibleTrigger asChild>
                            <button
                                type="button"
                                className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-left text-base font-semibold text-muted-foreground transition-colors hover:bg-muted/50"
                            >
                                <span>
                                    Архив ({archivedCars.length})
                                </span>
                                <ChevronDown
                                    className={cn(
                                        'size-5 shrink-0 transition-transform duration-200',
                                        archiveOpen && 'rotate-180',
                                    )}
                                />
                            </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="grid grid-cols-1 gap-4 data-[state=closed]:animate-out md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {archivedCars.map((car, index) => (
                                <CardMotion
                                    key={car.id}
                                    delay={index * 0.05}
                                    className="block h-full min-w-0"
                                >
                                    <Card className="h-full gap-0 overflow-hidden py-0 opacity-60 grayscale transition-opacity hover:opacity-80">
                                        <CarCardMedia car={car} />
                                        <CardHeader className="gap-2 p-3">
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <div className="min-w-0 space-y-1">
                                                    <CardTitle className="text-sm font-medium leading-snug">
                                                        {car.brand} {car.model}
                                                    </CardTitle>
                                                    <p className="text-xs text-muted-foreground">
                                                        {yearAndPlate(car)}
                                                    </p>
                                                    {car.generation?.name ? (
                                                        <p className="text-xs text-muted-foreground">
                                                            {car.generation.name}
                                                        </p>
                                                    ) : null}
                                                </div>
                                                <Badge variant="secondary">
                                                    В архиве
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    className="h-8 text-xs"
                                                    onClick={() =>
                                                        router.post(
                                                            toUrl(
                                                                unarchive.url(
                                                                    car.id,
                                                                ),
                                                            ),
                                                        )
                                                    }
                                                >
                                                    Восстановить
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    className="h-8 text-xs"
                                                    onClick={() =>
                                                        setDeleteTarget(car)
                                                    }
                                                >
                                                    Удалить
                                                </Button>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </CardMotion>
                            ))}
                        </CollapsibleContent>
                    </Collapsible>
                ) : null}
            </div>

            <AlertDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTarget(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Удалить автомобиль навсегда?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Будут удалены все записи и фото. Это действие нельзя
                            отменить.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogBody />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (!deleteTarget) {
                                    return;
                                }

                                router.delete(
                                    toUrl(
                                        destroyPermanent.url(deleteTarget.id),
                                    ),
                                    {
                                        onFinish: () =>
                                            setDeleteTarget(null),
                                    },
                                );
                            }}
                        >
                            Удалить
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
