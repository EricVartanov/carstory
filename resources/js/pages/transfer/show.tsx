import { Head, Link, router, useForm } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateRu } from '@/lib/ru';
import { cn, toUrl } from '@/lib/utils';
import { index as garageIndex, show as garageShow } from '@/routes/garage';
import { cancel, regenerate, sendEmail } from '@/routes/transfer';

type Car = {
    id: number;
    brand: string;
    model: string;
    year: number;
};

type Transfer = {
    id: number;
    token: string;
    status: string;
    expires_at: string | null;
};

type Props = {
    car: Car;
    transfer: Transfer;
    transferUrl: string;
};

function truncateUrl(url: string, max = 48): string {
    if (url.length <= max) {
        return url;
    }

    return `${url.slice(0, max - 6)}…${url.slice(-5)}`;
}

export default function TransferShow({ car, transfer, transferUrl }: Props) {
    const [copied, setCopied] = useState(false);

    const emailForm = useForm({
        email: '',
    });

    const copyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(transferUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    }, [transferUrl]);

    const shareLink = useCallback(async () => {
        if (!('share' in navigator)) {
            return;
        }

        try {
            await navigator.share({
                title: 'Передача автомобиля CaRStory',
                url: transferUrl,
            });
        } catch {
            // user cancelled or error
        }
    }, [transferUrl]);

    function submitEmail(e: React.FormEvent) {
        e.preventDefault();
        emailForm.post(toUrl(sendEmail(car.id)), {
            preserveScroll: true,
            onSuccess: () => emailForm.reset('email'),
        });
    }

    function onRegenerate() {
        if (
            !window.confirm(
                'Создать новую ссылку? Текущая перестанет работать.',
            )
        ) {
            return;
        }
        router.post(toUrl(regenerate(car.id)));
    }

    function onCancelTransfer() {
        if (
            !window.confirm(
                'Отменить передачу? Получатель не сможет принять автомобиль по ссылке.',
            )
        ) {
            return;
        }
        router.delete(toUrl(cancel(car.id)));
    }

    const expiresLabel = transfer.expires_at
        ? formatDateRu(transfer.expires_at)
        : '';

    return (
        <>
            <Head title="Передача автомобиля" />

            <div className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4">
                <div>
                    <h1 className="text-lg font-semibold">
                        Передача автомобиля
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {car.brand} {car.model} {car.year}
                    </p>
                </div>

                {expiresLabel ? (
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-950 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-100">
                        Ссылка действительна до {expiresLabel}
                    </div>
                ) : null}

                <div className="rounded-md border p-4">
                    <h2 className="text-sm font-medium">Скопировать ссылку</h2>
                    <p className="mt-1 font-mono text-xs break-all text-muted-foreground">
                        {truncateUrl(transferUrl)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => void copyLink()}
                        >
                            {copied ? 'Скопировано ✓' : 'Скопировать ссылку'}
                        </Button>
                        {'share' in navigator ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void shareLink()}
                            >
                                Поделиться
                            </Button>
                        ) : null}
                    </div>
                </div>

                <div className="rounded-md border p-4">
                    <h2 className="text-sm font-medium">QR-код</h2>
                    <div className="mt-3 flex flex-col items-center gap-2">
                        <div className={cn('rounded-md border bg-white p-2')}>
                            <QRCodeSVG value={transferUrl} size={200} />
                        </div>
                        <p className="text-center text-xs text-muted-foreground">
                            Покажите QR-код новому владельцу
                        </p>
                    </div>
                </div>

                <div className="rounded-md border p-4">
                    <h2 className="text-sm font-medium">Отправить на email</h2>
                    <form className="mt-3 grid gap-2" onSubmit={submitEmail}>
                        <div className="grid gap-2">
                            <Label htmlFor="transfer-email">Email</Label>
                            <Input
                                id="transfer-email"
                                type="email"
                                value={emailForm.data.email}
                                onChange={(e) =>
                                    emailForm.setData('email', e.target.value)
                                }
                                autoComplete="email"
                                required
                            />
                            <InputError message={emailForm.errors.email} />
                        </div>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={emailForm.processing}
                        >
                            Отправить
                        </Button>
                    </form>
                </div>

                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100">
                    ⚠️ После принятия передачи вы не сможете редактировать
                    историю автомобиля
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onRegenerate}
                    >
                        Создать новую ссылку
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={onCancelTransfer}
                    >
                        Отменить передачу
                    </Button>
                </div>

                <div>
                    <Button asChild variant="ghost" size="sm">
                        <Link href={garageShow(car.id)}>← К автомобилю</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

TransferShow.layout = {
    breadcrumbs: [
        { title: 'Гараж', href: garageIndex() },
        { title: 'Передача', href: null },
    ],
};
