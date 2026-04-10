import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { create } from '@/routes/garage';

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
};

export default function GarageIndex({ cars }: { cars: Car[] }) {
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
                        <div className="rounded-md border p-4 text-sm text-muted-foreground">Пока нет машин.</div>
                    ) : (
                        cars.map((car) => (
                            <div key={car.id} className="rounded-md border p-4">
                                <div className="font-medium">
                                    {car.brand} {car.model}
                                </div>
                                <div className="text-sm text-muted-foreground">{car.year}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

