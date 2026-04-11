import { Head, Link } from '@inertiajs/react';
import { CardMotion } from '@/components/card-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { create, show } from '@/routes/garage';

type Car = {
    id: number;
    brand: string;
    model: string;
    year: number;
    vin: string | null;
    plate: string | null;
    color: string | null;
    cover_photo: string | null;
    created_at: string;
    entries?: unknown[];
};

type PreviousCar = {
    car: Car;
    owned_from: string;
    owned_until: string;
};

export default function GarageIndex({
    cars,
    previousCars = [],
}: {
    cars: Car[];
    previousCars?: PreviousCar[];
}) {
    return (
        <>
            <Head title="Гараж" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-lg font-semibold">Гараж</h1>
                    <Button asChild>
                        <Link href={create()}>Добавить</Link>
                    </Button>
                </div>

                <div className="grid gap-2">
                    {cars.length === 0 ? (
                        <div className="rounded-md border p-4 text-sm text-muted-foreground">
                            Пока нет машин.
                        </div>
                    ) : (
                        cars.map((car, index) => (
                            <CardMotion
                                key={car.id}
                                delay={index * 0.05}
                                className="block"
                            >
                                <Link href={show(car.id)} className="block">
                                    <Card className="gap-0 py-0 transition-colors hover:bg-muted/50">
                                        <CardHeader className="gap-1 py-4">
                                            <CardTitle className="text-base">
                                                {car.brand} {car.model}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {car.year}
                                            </p>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            </CardMotion>
                        ))
                    )}
                </div>

                {previousCars.length > 0 ? (
                    <section className="flex flex-col gap-3 pt-2">
                        <h2 className="text-base font-semibold text-muted-foreground">
                            Проданные автомобили
                        </h2>
                        <div className="grid gap-2">
                            {previousCars.map((item, index) => (
                                <CardMotion
                                    key={`${item.car.id}-${item.owned_until}`}
                                    delay={index * 0.05}
                                    className="block"
                                >
                                    <Link
                                        href={show(item.car.id)}
                                        className="block"
                                    >
                                        <Card className="gap-0 border-muted bg-muted/20 py-0 opacity-70 grayscale transition-all hover:opacity-90 hover:grayscale-0">
                                            <CardHeader className="py-4">
                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1 space-y-1">
                                                        <CardTitle className="text-base">
                                                            {item.car.brand}{' '}
                                                            {item.car.model}
                                                        </CardTitle>
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.car.year}
                                                        </p>
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
            </div>
        </>
    );
}
