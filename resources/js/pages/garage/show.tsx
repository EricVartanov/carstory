import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Camera,
    Car as CarIcon,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { formatDateRu, formatMileageRu, formatMoneyRu } from '@/lib/ru';
import { storageUrl } from '@/lib/storage';
import { cn, toUrl } from '@/lib/utils';
import { destroy as entryDestroy, store as entryStore } from '@/routes/entries';
import {
    archive as garageArchive,
    edit as garageEdit,
    index as garageIndex,
    updateCover as garageUpdateCover,
} from '@/routes/garage';
import {
    create as transferCreate,
    cancel as transferCancel,
} from '@/routes/transfer';
import { DynamicIcon } from '@/lib/icons';
import type { CurrencyOption, EntryTypeOption, SharedEnums } from '@/types/enums';

type Car = {
    id: number;
    brand: string;
    model: string;
    year: number;
    vin: string | null;
    plate: string | null;
    color: string | null;
    cover_photo: string | null;
    is_archived: boolean;
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
    type: string;
    title: string | null;
    body: string | null;
    amount: string | number | null;
    currency: string | null;
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
    status: string;
} | null;

type Props = {
    car: Car;
    entries: Entry[];
    ownerships: Ownership[];
    isCurrentOwner: boolean;
    myOwnership: Ownership | null;
    pendingTransfer: PendingTransfer;
};

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
    const { enums } = usePage<PageProps>().props;
    const defaultType = enums.entryTypes[0]?.id ?? 'note';
    const defaultCurrency = enums.currencies[0]?.id ?? 'RUB';

    const { data, setData, processing, errors, reset, post } = useForm<{
        type: string;
        date: string;
        mileage: string;
        title: string;
        body: string;
        amount: string;
        currency: string;
        photos: File[];
    }>({
        type: defaultType,
        date: today,
        mileage: '',
        title: '',
        body: '',
        amount: '',
        currency: defaultCurrency,
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
                            onValueChange={(v) => setData('type', v)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Выберите тип" />
                            </SelectTrigger>
                            <SelectContent>
                                {enums.entryTypes.map((type: EntryTypeOption) => (
                                    <SelectItem key={type.id} value={type.id}>
                                        {type.label}
                                    </SelectItem>
                                ))}
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
                        <Textarea
                            id="body"
                            className="min-h-24"
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
                                onValueChange={(v) => setData('currency', v)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Валюта" />
                                </SelectTrigger>
                                <SelectContent>
                                    {enums.currencies.map(
                                        (currency: CurrencyOption) => (
                                            <SelectItem
                                                key={currency.id}
                                                value={currency.id}
                                            >
                                                {currency.symbol} {currency.id}
                                            </SelectItem>
                                        ),
                                    )}
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
    enums: SharedEnums;
};

export default function GarageShow({
    car,
    entries,
    isCurrentOwner,
    myOwnership,
    pendingTransfer,
}: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const coverPhotoInputRef = useRef<HTMLInputElement>(null);
    const [coverUploading, setCoverUploading] = useState(false);
    const page = usePage<PageProps>();
    const authUser = page.props.auth.user;
    const { enums } = page.props;

    const historyFilters = useMemo(() => {
        return [
            { id: 'all', label: 'Все', icon: null },
            ...enums.entryTypes.map((t) => ({
                id: t.id,
                label: t.label,
                icon: t.icon,
            })),
            { id: 'photos', label: 'Фото', icon: 'Camera' },
        ] as const;
    }, [enums.entryTypes]);

    function getEntryTypeOption(typeId: string): EntryTypeOption | undefined {
        return enums.entryTypes.find((t) => t.id === typeId);
    }

    function entryTypeBadgeMeta(typeId: string): {
        label: string;
        variant: 'default' | 'secondary' | 'outline';
        icon: string;
    } {
        const option = getEntryTypeOption(typeId);
        const label = option?.label ?? typeId;
        const icon = option?.icon ?? 'FileText';

        switch (typeId) {
            case 'service':
                return { label, variant: 'default', icon };
            case 'trip':
                return { label, variant: 'outline', icon };
            case 'fuel':
            case 'note':
            default:
                return { label, variant: 'secondary', icon };
        }
    }

    const filteredEntries = useMemo(() => {
        if (activeFilter === 'all') {
            return entries;
        }

        if (activeFilter === 'photos') {
            return entries.filter((e) => (e.photos?.length ?? 0) > 0);
        }

        return entries.filter((e) => e.type === activeFilter);
    }, [entries, activeFilter]);

    const coverSrc = storageUrl(car.cover_photo);

    return (
        <>
            <Head title={`${car.brand} ${car.model}`} />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
                <Card className="gap-0 py-0">
                    <CardHeader className="p-5">
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:max-w-md">
                                {coverSrc ? (
                                    <img
                                        src={coverSrc}
                                        alt={`${car.brand} ${car.model}`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-800 to-slate-900">
                                        <CarIcon className="size-12 text-slate-400" />
                                    </div>
                                )}
                                {isCurrentOwner ? (
                                    <>
                                        <input
                                            ref={coverPhotoInputRef}
                                            type="file"
                                            name="cover_photo"
                                            accept="image/*"
                                            className="sr-only"
                                            disabled={coverUploading}
                                            onChange={(e) => {
                                                const file =
                                                    e.target.files?.[0] ??
                                                    null;
                                                const input = e.target;

                                                if (!file) {
                                                    return;
                                                }

                                                setCoverUploading(true);
                                                router.post(
                                                    toUrl(
                                                        garageUpdateCover.url(
                                                            car.id,
                                                        ),
                                                    ),
                                                    { cover_photo: file },
                                                    {
                                                        forceFormData: true,
                                                        preserveScroll: true,
                                                        onFinish: () => {
                                                            setCoverUploading(
                                                                false,
                                                            );
                                                            input.value = '';
                                                        },
                                                    },
                                                );
                                            }}
                                        />
                                        <button
                                            type="button"
                                            disabled={coverUploading}
                                            onClick={() =>
                                                coverPhotoInputRef.current?.click()
                                            }
                                            className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-xs text-white transition-opacity hover:bg-black/60 disabled:opacity-50"
                                        >
                                            <Camera
                                                className="size-3.5 shrink-0"
                                                strokeWidth={2}
                                            />
                                            Изменить фото
                                        </button>
                                    </>
                                ) : null}
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <CardTitle className="text-lg leading-tight">
                                    {car.brand} {car.model} {car.year}
                                </CardTitle>
                                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                                    {car.plate ? <span>{car.plate}</span> : null}
                                    {car.plate && car.color ? (
                                        <span aria-hidden>•</span>
                                    ) : null}
                                    {car.color ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            {(() => {
                                                const option = enums.carColors.find(
                                                    (c) => c.id === car.color,
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
                                        </span>
                                    ) : null}
                                    {!car.plate && !car.color ? (
                                        <span>—</span>
                                    ) : null}
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">
                                    {isCurrentOwner ? (
                                        <>
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="secondary"
                                            >
                                                <Link href={garageEdit.url(car.id)}>
                                                    Редактировать
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

                                            {!car.is_archived ? (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setArchiveOpen(true)
                                                    }
                                                >
                                                    В архив
                                                </Button>
                                            ) : null}
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    {isCurrentOwner && pendingTransfer ? (
                        <CardFooter className="flex-col items-stretch gap-2 border-t bg-yellow-50 py-4 text-sm text-yellow-900 sm:flex-row sm:items-center sm:justify-between dark:bg-yellow-950/30 dark:text-yellow-200">
                            <div className="font-medium">
                                Передача ожидает подтверждения
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="w-full sm:w-auto"
                                onClick={() =>
                                    router.delete(
                                        toUrl(transferCancel(car.id)),
                                    )
                                }
                            >
                                Отменить
                            </Button>
                        </CardFooter>
                    ) : null}

                    {!isCurrentOwner && myOwnership ? (
                        <CardFooter className="border-t bg-blue-50 py-4 text-sm text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
                            Вы владели этим автомобилем с{' '}
                            {formatDateRu(myOwnership.owned_from)} по{' '}
                            {myOwnership.owned_until
                                ? formatDateRu(myOwnership.owned_until)
                                : 'настоящее время'}
                        </CardFooter>
                    ) : null}
                </Card>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-base font-semibold">История</h2>
                    {isCurrentOwner ? (
                        <Button size="sm" onClick={() => setModalOpen(true)}>
                            Добавить запись
                        </Button>
                    ) : null}
                </div>

                {entries.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        <div
                            className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                            role="tablist"
                            aria-label="Фильтр записей"
                        >
                            {historyFilters.map((f) => {
                                const active = activeFilter === f.id;

                                return (
                                    <button
                                        key={f.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setActiveFilter(f.id)}
                                        className={cn(
                                            'inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm whitespace-nowrap transition-colors duration-150',
                                            active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-secondary-foreground',
                                        )}
                                    >
                                        {f.icon ? (
                                            <DynamicIcon
                                                name={f.icon}
                                                className="size-3.5 shrink-0"
                                            />
                                        ) : null}
                                        {f.label}
                                    </button>
                                );
                            })}
                        </div>
                        {activeFilter !== 'all' ? (
                            <p className="text-sm text-muted-foreground">
                                Показано {filteredEntries.length} из{' '}
                                {entries.length} записей
                            </p>
                        ) : null}
                    </div>
                ) : null}

                {entries.length === 0 ? (
                    <div className="rounded-md border p-4 text-sm text-muted-foreground">
                        История пока пуста. Добавьте первую запись.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        <AnimatePresence mode="popLayout">
                            {filteredEntries.map((entry, i) => {
                                const typeMeta = entryTypeBadgeMeta(entry.type);

                                return (
                                    <motion.div
                                        key={entry.id}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{
                                            duration: 0.2,
                                            delay: i * 0.03,
                                        }}
                                        className="block"
                                    >
                                    <Card className="gap-0 py-4">
                                        <CardHeader className="gap-3 pb-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-start gap-3">
                                                    <div className="mt-0.5 text-muted-foreground">
                                                        <DynamicIcon
                                                            name={typeMeta.icon}
                                                            className="size-4"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 space-y-2">
                                                        <Badge
                                                            variant={
                                                                typeMeta.variant
                                                            }
                                                            className="font-normal"
                                                        >
                                                            {typeMeta.label}
                                                        </Badge>
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatDateRu(
                                                                entry.date,
                                                            )}
                                                            {entry.mileage !==
                                                            null
                                                                ? ` • ${formatMileageRu(entry.mileage)}`
                                                                : null}
                                                        </div>
                                                        {entry.title ? (
                                                            <CardTitle className="text-base leading-snug">
                                                                {entry.title}
                                                            </CardTitle>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                {isCurrentOwner &&
                                                authUser &&
                                                entry.user_id ===
                                                    authUser.id ? (
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
                                                                        entryDestroy(
                                                                            {
                                                                                car: car.id,
                                                                                entry: entry.id,
                                                                            },
                                                                        ),
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
                                        </CardHeader>

                                        {entry.body ? (
                                            <CardContent className="pt-0 pb-0">
                                                <div className="text-sm whitespace-pre-wrap">
                                                    {entry.body}
                                                </div>
                                            </CardContent>
                                        ) : null}

                                        {entry.amount !== null &&
                                        entry.amount !== '' ? (
                                            <CardContent className="pt-2 pb-0">
                                                <div className="text-sm font-medium">
                                                    {(() => {
                                                        const formatted =
                                                            formatMoneyRu(
                                                                entry.amount,
                                                            );
                                                        const code =
                                                            entry.currency ??
                                                            null;
                                                        const symbol = code
                                                            ? enums.currencies.find(
                                                                  (c) =>
                                                                      c.id ===
                                                                      code,
                                                              )?.symbol
                                                            : null;

                                                        return symbol
                                                            ? `${formatted} ${symbol}`
                                                            : formatted;
                                                    })()}
                                                </div>
                                            </CardContent>
                                        ) : null}

                                        {entry.photos?.length ? (
                                            <CardContent className="pt-3 pb-0">
                                                <div className="grid grid-cols-3 gap-2">
                                                    {entry.photos.map(
                                                        (photo) => (
                                                            <a
                                                                key={photo.id}
                                                                href={photo.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="block"
                                                            >
                                                                <img
                                                                    src={
                                                                        photo.url
                                                                    }
                                                                    alt={
                                                                        photo.original_name ??
                                                                        'Фото'
                                                                    }
                                                                    className="aspect-square w-full rounded-md object-cover"
                                                                />
                                                            </a>
                                                        ),
                                                    )}
                                                </div>
                                            </CardContent>
                                        ) : null}
                                    </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                <AlertDialog
                    open={archiveOpen}
                    onOpenChange={setArchiveOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Переместить в архив?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Машина будет скрыта из гаража. Вы сможете
                                восстановить её в любой момент из раздела
                                Архив.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    router.post(
                                        toUrl(garageArchive.url(car.id)),
                                        {},
                                        {
                                            onFinish: () =>
                                                setArchiveOpen(false),
                                        },
                                    );
                                }}
                            >
                                В архив
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

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
