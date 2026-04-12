import { Head, useForm } from '@inertiajs/react';
import { Car } from 'lucide-react';
import { useRef, useState } from 'react';
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
import { index, store } from '@/routes/garage';

type FormFields = {
    brand_id: number | null;
    brand_name: string;
    model_id: number | null;
    model_name: string;
    year: string;
    vin: string;
    plate: string;
    color: string;
    cover_photo: File | null;
};

function applyBrandModel(data: FormFields, p: BrandModelPayload): FormFields {
    return {
        ...data,
        brand_id: p.brand_id,
        brand_name: p.brand_name,
        model_id: p.model_id,
        model_name: p.model_name,
    };
}

export default function GarageCreate() {
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const { data, setData, processing, errors, post } = useForm<FormFields>({
        brand_id: null,
        brand_name: '',
        model_id: null,
        model_name: '',
        year: '',
        vin: '',
        plate: '',
        color: '',
        cover_photo: null,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(toUrl(store.url()), {
            forceFormData: data.cover_photo !== null,
        });
    }

    return (
        <>
            <Head title="Добавить машину" />

            <div className="flex flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Добавить машину</CardTitle>
                        <CardDescription>
                            Выберите марку и модель из каталога или укажите
                            вручную.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <form onSubmit={submit} className="grid gap-6">
                    <div className="grid gap-2">
                        <div
                            className="relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-secondary transition-opacity hover:opacity-95"
                            onClick={() => coverInputRef.current?.click()}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    coverInputRef.current?.click();
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label="Выбрать фото автомобиля"
                        >
                            {coverPreview ? (
                                <img
                                    src={coverPreview}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Car
                                    className="size-12 text-muted-foreground"
                                    strokeWidth={1.25}
                                />
                            )}
                        </div>
                        <input
                            ref={coverInputRef}
                            type="file"
                            name="cover_photo"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                setData('cover_photo', file);
                                if (!file) {
                                    setCoverPreview(null);
                                    return;
                                }
                                const reader = new FileReader();
                                reader.onload = () => {
                                    if (typeof reader.result === 'string') {
                                        setCoverPreview(reader.result);
                                    }
                                };
                                reader.readAsDataURL(file);
                            }}
                        />
                        <p className="text-xs text-muted-foreground">
                            Фото автомобиля (необязательно)
                        </p>
                        <InputError message={errors.cover_photo} />
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <BrandModelSelect
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
