import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Car as CarIcon,
    Fuel,
    NotebookPen,
    Pencil,
    Trash2,
    Wrench,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatDateRu, formatMileageRu, formatMoneyRu } from '@/lib/ru';
import { cn, toUrl } from '@/lib/utils';
import { index as garageIndex, show as garageShow } from '@/routes/garage';
import {
    create as transferCreate,
    cancel as transferCancel,
} from '@/routes/transfer';
import { destroy as entryDestroy, store as entryStore } from '@/routes/entries';

type Car = {
    id: number;
    brand: string;
    model: string;
    year: number;
    vin: string | null;
    plate: string | null;
    color: string | null;
    cover_photo: string | null;
};

type EntryPhoto = {
    id: number;
    url: string;
    original_name: string | null;
    order: number;
};

type Entry = {
    id: number;
    user_id: number;
    date: string;
    mileage: number | null;
    type: 'note' | 'service' | 'trip' | 'fuel';
    title: string | null;
    body: string | null;
    amount: string | number | null;
    currency: 'RUB' | 'AMD' | 'KZT' | 'UAH' | 'BYN' | 'USD' | null;
    photos: EntryPhoto[];
};

type Ownership = {
    id: number;
    owned_from: string;
    owned_until: string | null;
    user_id: number;
};

type PendingTransfer = {
    id: number;
    status: 'pending' | 'accepted' | 'cancelled';
} | null;

type Props = {
    car: Car;
    entries: Entry[];
    ownerships: Ownership[];
    isCurrentOwner: boolean;
    myOwnership: Ownership | null;
    pendingTransfer: PendingTransfer;
};

function EntryTypeIcon({ type }: { type: Entry['type'] }) {
    switch (type) {
        case 'note':
            return <NotebookPen className="size-4" />;
        case 'service':
            return <Wrench className="size-4" />;
        case 'trip':
            return <CarIcon className="size-4" />;
        case 'fuel':
            return <Fuel className="size-4" />;
    }
}

function EntryModal({
    carId,
    open,
    onOpenChange,
}: {
    carId: number;
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const { data, setData, processing, errors, reset, post } = useForm<{
        type: Entry['type'];
        date: string;
        mileage: string;
        title: string;
        body: string;
        amount: string;
        currency: NonNullable<Entry['currency']>;
        photos: File[];
    }>({
        type: 'note',
        date: today,
        mileage: '',
        title: '',
        body: '',
        amount: '',
        currency: 'RUB',
        photos: [],
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post(toUrl(entryStore(carId)), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0">
                <form onSubmit={submit} className="grid gap-4 p-6">
                    <DialogHeader>
                        <DialogTitle>Добавить запись</DialogTitle>
                        <DialogDescription>
                            Заполните детали и сохраните в историю автомобиля.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label>Тип</Label>
                        <Select
                            value={data.type}
                            onValueChange={(v) =>
                                setData('type', v as Entry['type'])
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Выберите тип" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="note">📝 Заметка</SelectItem>
                                <SelectItem value="service">
                                    🔧 Обслуживание
                                </SelectItem>
                                <SelectItem value="trip">🚗 Поездка</SelectItem>
                                <SelectItem value="fuel">
                                    ⛽ Заправка
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.type} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="date">Дата</Label>
                        <Input
                            id="date"
                            type="date"
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                            required
                        />
                        <InputError message={errors.date} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="mileage">Пробег</Label>
                        <Input
                            id="mileage"
                            inputMode="numeric"
                            type="number"
                            min={0}
                            placeholder="25000"
                            value={data.mileage}
                            onChange={(e) => setData('mileage', e.target.value)}
                        />
                        <InputError message={errors.mileage} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="title">Заголовок</Label>
                        <Input
                            id="title"
                            placeholder="Например: замена масла"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="body">Заметка</Label>
                        <textarea
                            id="body"
                            className={cn(
                                'flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                                'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
                            )}
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                        />
                        <InputError message={errors.body} />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Сумма</Label>
                            <Input
                                id="amount"
                                inputMode="decimal"
                                type="number"
                                min={0}
                                step="0.01"
                                value={data.amount}
                                onChange={(e) =>
                                    setData('amount', e.target.value)
                                }
                            />
                            <InputError message={errors.amount} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Валюта</Label>
                            <Select
                                value={data.currency}
                                onValueChange={(v) =>
                                    setData(
                                        'currency',
                                        v as Props['entries'][number]['currency'] &
                                            string,
                                    )
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Валюта" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="RUB">RUB</SelectItem>
                                    <SelectItem value="AMD">AMD</SelectItem>
                                    <SelectItem value="KZT">KZT</SelectItem>
                                    <SelectItem value="UAH">UAH</SelectItem>
                                    <SelectItem value="BYN">BYN</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.currency} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="photos">Фото</Label>
                        <Input
                            id="photos"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) =>
                                setData(
                                    'photos',
                                    Array.from(e.target.files ?? []),
                                )
                            }
                        />
                        <InputError message={errors.photos} />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Отмена
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Сохранить
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

type PageProps = Props & {
    auth: { user: { id: number; email: string; name?: string } | null };
};

export default function GarageShow({
    car,
    entries,
    isCurrentOwner,
    myOwnership,
    pendingTransfer,
}: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const authUser = usePage<PageProps>().props.auth.user;

    return (
        <>
            <Head title={`${car.brand} ${car.model}`} />

            <div className="flex flex-col gap-4 p-4">
                <div className="rounded-md border">
                    <div className="flex gap-4 p-4">
                        <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-muted sm:size-28">
                            {car.cover_photo ? (
                                <img
                                    src={car.cover_photo}
                                    alt={`${car.brand} ${car.model}`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                    <CarIcon className="size-8" />
                                </div>
                            )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <div className="text-lg leading-tight font-semibold">
                                {car.brand} {car.model} {car.year}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {[car.plate, car.color]
                                    .filter(Boolean)
                                    .join(' • ') || '—'}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2">
                                {isCurrentOwner ? (
                                    <>
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="secondary"
                                        >
                                            <Link href={garageShow(car.id)}>
                                                Обновить
                                            </Link>
                                        </Button>

                                        {!pendingTransfer ? (
                                            <Button asChild size="sm">
                                                <Link
                                                    href={transferCreate(
                                                        car.id,
                                                    )}
                                                >
                                                    Передать машину
                                                </Link>
                                            </Button>
                                        ) : null}
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {isCurrentOwner && pendingTransfer ? (
                        <div className="border-t bg-yellow-50 p-4 text-sm text-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-200">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="font-medium">
                                    Передача ожидает подтверждения
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                        router.delete(
                                            toUrl(transferCancel(car.id)),
                                        )
                                    }
                                >
                                    Отменить
                                </Button>
                            </div>
                        </div>
                    ) : null}

                    {!isCurrentOwner && myOwnership ? (
                        <div className="border-t bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
                            Вы владели этим автомобилем с{' '}
                            {formatDateRu(myOwnership.owned_from)} по{' '}
                            {myOwnership.owned_until
                                ? formatDateRu(myOwnership.owned_until)
                                : 'настоящее время'}
                        </div>
                    ) : null}
                </div>

                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold">История</h2>
                    {isCurrentOwner ? (
                        <Button size="sm" onClick={() => setModalOpen(true)}>
                            Добавить запись
                        </Button>
                    ) : null}
                </div>

                {entries.length === 0 ? (
                    <div className="rounded-md border p-4 text-sm text-muted-foreground">
                        История пока пуста. Добавьте первую запись.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {entries.map((entry) => (
                            <div
                                key={entry.id}
                                className="rounded-md border p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="mt-0.5 text-muted-foreground">
                                            <EntryTypeIcon type={entry.type} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm text-muted-foreground">
                                                {formatDateRu(entry.date)}
                                                {entry.mileage !== null
                                                    ? ` • ${formatMileageRu(entry.mileage)}`
                                                    : null}
                                            </div>
                                            {entry.title ? (
                                                <div className="mt-1 leading-snug font-medium">
                                                    {entry.title}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    {isCurrentOwner &&
                                    authUser &&
                                    entry.user_id === authUser.id ? (
                                        <div className="flex shrink-0 items-center gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                disabled
                                                title="Редактировать (в разработке)"
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={() =>
                                                    router.delete(
                                                        toUrl(
                                                            entryDestroy({
                                                                car: car.id,
                                                                entry: entry.id,
                                                            }),
                                                        ),
                                                    )
                                                }
                                                title="Удалить"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ) : null}
                                </div>

                                {entry.body ? (
                                    <div className="mt-3 text-sm whitespace-pre-wrap">
                                        {entry.body}
                                    </div>
                                ) : null}

                                {entry.amount !== null &&
                                entry.amount !== '' ? (
                                    <div className="mt-3 text-sm font-medium">
                                        {formatMoneyRu(
                                            entry.amount,
                                            entry.currency ?? 'RUB',
                                        )}
                                    </div>
                                ) : null}

                                {entry.photos?.length ? (
                                    <div className="mt-3 grid grid-cols-3 gap-2">
                                        {entry.photos.map((photo) => (
                                            <a
                                                key={photo.id}
                                                href={photo.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block"
                                            >
                                                <img
                                                    src={photo.url}
                                                    alt={
                                                        photo.original_name ??
                                                        'Фото'
                                                    }
                                                    className="aspect-square w-full rounded-md object-cover"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-2">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={garageIndex()}>← В гараж</Link>
                    </Button>
                </div>
            </div>

            {isCurrentOwner ? (
                <EntryModal
                    carId={car.id}
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                />
            ) : null}
        </>
    );
}

GarageShow.layout = {
    breadcrumbs: [
        {
            title: 'Гараж',
            href: garageIndex(),
        },
        {
            title: 'Машина',
            href: null,
        },
    ],
};
