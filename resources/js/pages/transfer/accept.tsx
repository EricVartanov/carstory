import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { toUrl } from '@/lib/utils';
import { index as garageIndex } from '@/routes/garage';
import { confirm } from '@/routes/transfer';

type TransferAccept = {
    id: number;
    car: {
        id: number;
        brand: string;
        model: string;
        year: number;
    };
    from_user: {
        email: string;
    };
};

type Props = {
    transfer: TransferAccept;
    token: string;
};

export default function TransferAccept({ transfer, token }: Props) {
    const { car, from_user: fromUser } = transfer;

    function onConfirm() {
        router.post(toUrl(confirm(token)));
    }

    return (
        <>
            <Head title="Принять автомобиль" />

            <div className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4">
                <h1 className="text-lg font-semibold">
                    Вам передают автомобиль
                </h1>

                <div className="text-2xl leading-tight font-semibold">
                    {car.brand} {car.model} {car.year}
                </div>

                <p className="text-sm text-muted-foreground">
                    От: {fromUser.email}
                </p>

                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-950 dark:border-green-900 dark:bg-green-950/30 dark:text-green-100">
                    После принятия автомобиль появится в вашем гараже. Вы
                    сможете просматривать всю историю и добавлять новые записи.
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" onClick={onConfirm}>
                        Принять автомобиль
                    </Button>
                    <Button asChild variant="secondary" type="button">
                        <Link href={garageIndex()}>Отмена</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

TransferAccept.layout = {
    breadcrumbs: [
        { title: 'Гараж', href: garageIndex() },
        { title: 'Принять передачу', href: null },
    ],
};
