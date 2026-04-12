import { Head, useForm } from '@inertiajs/react';
import { BrandModelSelect } from '@/components/brand-model-select';
import type { BrandModelPayload } from '@/components/brand-model-select';
import { ColorPicker } from '@/components/color-picker';
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
import { toUrl } from '@/lib/utils';
import { index, update } from '@/routes/garage';

type CarFormDefaults = {
    id: number;
    brand_id: number | null;
    brand_name: string;
    model_id: number | null;
    model_name: string;
    year: string;
    vin: string;
    plate: string;
    color: string;
};

type FormData = Omit<CarFormDefaults, 'id'>;

function applyBrandModel(data: FormData, p: BrandModelPayload): FormData {
    return {
        ...data,
        brand_id: p.brand_id,
        brand_name: p.brand_name,
        model_id: p.model_id,
        model_name: p.model_name,
    };
}

export default function GarageEdit({ car }: { car: CarFormDefaults }) {
    const { data, setData, processing, errors, patch } = useForm<FormData>({
        brand_id: car.brand_id,
        brand_name: car.brand_name,
        model_id: car.model_id,
        model_name: car.model_name,
        year: car.year,
        vin: car.vin,
        plate: car.plate,
        color: car.color,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        patch(toUrl(update.url(car.id)));
    }

    return (
        <>
            <Head title="Редактировать машину" />

            <div className="flex flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Редактировать машину</CardTitle>
                        <CardDescription>
                            Обновите данные автомобиля и сохраните изменения.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <form onSubmit={submit} className="grid gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <BrandModelSelect
                                key={car.id}
                                defaultBrand={
                                    data.brand_id !== null
                                        ? {
                                              id: data.brand_id,
                                              name: data.brand_name,
                                          }
                                        : data.brand_name.trim() !== ''
                                          ? {
                                                id: null,
                                                name: data.brand_name,
                                            }
                                          : null
                                }
                                defaultModel={
                                    data.model_id !== null
                                        ? {
                                              id: data.model_id,
                                              name: data.model_name,
                                          }
                                        : data.model_name.trim() !== ''
                                          ? {
                                                id: null,
                                                name: data.model_name,
                                            }
                                          : null
                                }
                                onBrandChange={(p) =>
                                    setData((d) => applyBrandModel(d, p))
                                }
                                onModelChange={(p) =>
                                    setData((d) => applyBrandModel(d, p))
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={errors.brand_id}
                            />
                            <InputError message={errors.brand_name} />
                            <InputError message={errors.model_id} />
                            <InputError message={errors.model_name} />
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
                        <Label>Цвет автомобиля</Label>
                        <ColorPicker
                            value={data.color}
                            onChange={(v) => setData('color', v)}
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

GarageEdit.layout = {
    breadcrumbs: [
        {
            title: 'Гараж',
            href: index(),
        },
        {
            title: 'Редактировать',
            href: null,
        },
    ],
};
