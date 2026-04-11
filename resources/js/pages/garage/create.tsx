import { Head, router, useForm } from '@inertiajs/react';
import { CarAutocomplete } from '@/components/car-autocomplete';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { index, store } from '@/routes/garage';

type CatalogItem = { id: number; name: string };

type FormData = {
    car_brand_id: number | null;
    car_model_id: number | null;
    brand: string;
    model: string;
    year: string;
    vin: string;
    plate: string;
    color: string;
};

export default function GarageCreate() {
    const { data, setData, processing, errors } = useForm<FormData>({
        car_brand_id: null,
        car_model_id: null,
        brand: '',
        model: '',
        year: '',
        vin: '',
        plate: '',
        color: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        router.post(store().url, data);
    }

    return (
        <>
            <Head title="Добавить машину" />

            <div className="flex flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Добавить машину</CardTitle>
                        <CardDescription>
                            Выберите марку/модель из каталога или введите
                            вручную.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <form onSubmit={submit} className="grid gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <CarAutocomplete
                                initialBrand={data.brand}
                                initialModel={data.model}
                                onBrandSelect={(
                                    brand: CatalogItem | null,
                                    meta,
                                ) => {
                                    setData(
                                        'car_brand_id',
                                        brand ? brand.id : null,
                                    );
                                    setData('brand', meta.text);
                                    setData('car_model_id', null);
                                    setData('model', '');
                                }}
                                onModelSelect={(
                                    model: CatalogItem | null,
                                    meta,
                                ) => {
                                    setData(
                                        'car_model_id',
                                        model ? model.id : null,
                                    );
                                    setData('model', meta.text);
                                }}
                            />
                        </CardContent>
                    </Card>

                    <div className="grid gap-2">
                        <Label htmlFor="year">Год</Label>
                        <Input
                            id="year"
                            inputMode="numeric"
                            value={data.year}
                            onChange={(e) => setData('year', e.target.value)}
                            placeholder="Например: 2018"
                            required
                        />
                        <InputError message={errors.year} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="vin">VIN</Label>
                        <Input
                            id="vin"
                            value={data.vin}
                            onChange={(e) => setData('vin', e.target.value)}
                            placeholder="17 символов (опционально)"
                        />
                        <InputError message={errors.vin} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="plate">Гос. номер</Label>
                        <Input
                            id="plate"
                            value={data.plate}
                            onChange={(e) => setData('plate', e.target.value)}
                            placeholder="Опционально"
                        />
                        <InputError message={errors.plate} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="color">Цвет</Label>
                        <Input
                            id="color"
                            value={data.color}
                            onChange={(e) => setData('color', e.target.value)}
                            placeholder="Опционально"
                        />
                        <InputError message={errors.color} />
                    </div>

                    <Button
                        type="submit"
                        className="w-full sm:w-auto"
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        Сохранить
                    </Button>
                </form>
            </div>
        </>
    );
}

GarageCreate.layout = {
    breadcrumbs: [
        {
            title: 'Гараж',
            href: index(),
        },
        {
            title: 'Добавить',
            href: null,
        },
    ],
};
