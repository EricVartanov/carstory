import { Head, useForm, usePage } from '@inertiajs/react';
import { Car } from 'lucide-react';
import { useState } from 'react';
import { BrandModelSelect } from '@/components/brand-model-select';
import type { BrandModelPayload } from '@/components/brand-model-select';
import type { GenerationOption } from '@/components/brand-model-select';
import { ColorPicker } from '@/components/color-picker';
import { ImageCropModal } from '@/components/image-crop-modal';
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
import { useImageCrop } from '@/hooks/use-image-crop';
import { storageUrl } from '@/lib/storage';
import { toUrl } from '@/lib/utils';
import { index, update } from '@/routes/garage';
import type { SharedEnums } from '@/types/enums';

type CarFormDefaults = {
    id: number;
    brand_id: number | null;
    brand_name: string;
    model_id: number | null;
    model_name: string;
    car_generation_id: number | null;
    generation: GenerationOption | null;
    year: string;
    vin: string;
    plate: string;
    color: string;
    cover_photo: string | null;
};

type FormFields = Omit<CarFormDefaults, 'id' | 'cover_photo' | 'generation'> & {
    cover_photo: File | null;
    generation_name: string | null;
    temp_path: string | null;
};

function applyBrandModel(data: FormFields, p: BrandModelPayload): FormFields {
    return {
        ...data,
        brand_id: p.brand_id,
        brand_name: p.brand_name,
        model_id: p.model_id,
        model_name: p.model_name,
        car_generation_id: null,
        generation_name: null,
    };
}

export default function GarageEdit({ car }: { car: CarFormDefaults }) {
    const [coverPreview, setCoverPreview] = useState<string | null>(() =>
        storageUrl(car.cover_photo),
    );
    const {
        fileInputRef: coverFileInputRef,
        modalOpen: coverModalOpen,
        uploading: coverUploading,
        tempResult: coverTempResult,
        openFilePicker: openCoverFilePicker,
        handleFileChange: handleCoverFileChange,
        handleClose: handleCoverClose,
        setTempResult: setCoverTempResult,
        setModalOpen: setCoverModalOpen,
    } = useImageCrop();
    const { enums } = usePage<{ enums: SharedEnums }>().props;

    const { data, setData, processing, errors, patch } = useForm<FormFields>({
        brand_id: car.brand_id,
        brand_name: car.brand_name,
        model_id: car.model_id,
        model_name: car.model_name,
        car_generation_id: car.car_generation_id,
        generation_name: car.generation?.name ?? null,
        year: car.year,
        vin: car.vin,
        plate: car.plate,
        color: car.color,
        cover_photo: null,
        temp_path: null,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        patch(toUrl(update.url(car.id)), {
            forceFormData: data.cover_photo !== null,
            onFinish: () => {
                setData('temp_path', null);
            },
        });
    }

    return (
        <>
            <Head title="Редактировать машину" />

            <div className="mx-auto w-full max-w-4xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Редактировать машину</CardTitle>
                        <CardDescription>
                            Обновите данные автомобиля и сохраните изменения.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="grid gap-6">
                            <div className="grid gap-6 lg:grid-cols-[18rem_1fr] lg:items-start">
                                <div className="grid gap-2">
                                    <div
                                        className="relative flex aspect-4/3 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-secondary transition-opacity hover:opacity-95 lg:aspect-square"
                                        onClick={openCoverFilePicker}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ' '
                                            ) {
                                                e.preventDefault();
                                                openCoverFilePicker();
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
                                        ref={coverFileInputRef}
                                        type="file"
                                        name="cover_photo"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={handleCoverFileChange}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Фото автомобиля (необязательно)
                                    </p>
                                    <InputError message={errors.cover_photo} />
                                </div>

                                <div className="grid gap-6">
                                    <div>
                                        <BrandModelSelect
                                            key={car.id}
                                            defaultBrand={
                                                data.brand_id !== null
                                                    ? {
                                                          id: data.brand_id,
                                                          name: data.brand_name,
                                                      }
                                                    : data.brand_name.trim() !==
                                                        ''
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
                                                    : data.model_name.trim() !==
                                                        ''
                                                      ? {
                                                            id: null,
                                                            name: data.model_name,
                                                        }
                                                      : null
                                            }
                                            onBrandChange={(p) =>
                                                setData((d) =>
                                                    applyBrandModel(d, p),
                                                )
                                            }
                                            onModelChange={(p) =>
                                                setData((d) =>
                                                    applyBrandModel(d, p),
                                                )
                                            }
                                            defaultGeneration={car.generation}
                                            onGenerationChange={(
                                                gen: GenerationOption | null,
                                            ) =>
                                                setData((d) => ({
                                                    ...d,
                                                    car_generation_id:
                                                        gen?.id ?? null,
                                                    generation_name:
                                                        gen?.name ?? null,
                                                }))
                                            }
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={errors.brand_id}
                                        />
                                        <InputError message={errors.brand_name} />
                                        <InputError message={errors.model_id} />
                                        <InputError
                                            message={errors.model_name}
                                        />
                                        <InputError
                                            message={errors.car_generation_id}
                                        />
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="year">Год</Label>
                                            <Input
                                                id="year"
                                                inputMode="numeric"
                                                value={data.year}
                                                onChange={(e) =>
                                                    setData(
                                                        'year',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Например: 2018"
                                                required
                                            />
                                            <InputError message={errors.year} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="plate">
                                                Гос. номер
                                            </Label>
                                            <Input
                                                id="plate"
                                                value={data.plate}
                                                onChange={(e) =>
                                                    setData(
                                                        'plate',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Опционально"
                                            />
                                            <InputError
                                                message={errors.plate}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="vin">VIN</Label>
                                        <Input
                                            id="vin"
                                            value={data.vin}
                                            onChange={(e) =>
                                                setData('vin', e.target.value)
                                            }
                                            placeholder="17 символов (опционально)"
                                        />
                                        <InputError message={errors.vin} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Цвет автомобиля</Label>
                                        <ColorPicker
                                            value={data.color}
                                            colors={enums.carColors}
                                            onChange={(v) =>
                                                setData('color', v)
                                            }
                                        />
                                        <InputError message={errors.color} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing && <Spinner />}
                                    Сохранить
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <ImageCropModal
                open={coverModalOpen}
                uploading={coverUploading}
                tempResult={coverTempResult}
                onClose={handleCoverClose}
                title="Фото автомобиля"
                aspect={4 / 3}
                onSave={(blob, tempPath) => {
                    const file = new File([blob], 'cover.jpg', {
                        type: 'image/jpeg',
                    });

                    setData('cover_photo', file);
                    setData('temp_path', tempPath);
                    setCoverPreview(URL.createObjectURL(file));

                    setCoverTempResult(null);
                    setCoverModalOpen(false);
                }}
            />
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
