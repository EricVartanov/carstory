import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
                <div>
                    <h1 className="text-lg font-semibold">
                        Вам передают автомобиль
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl leading-tight">
                            {car.brand} {car.model} {car.year}
                        </CardTitle>
                        <CardDescription>От: {fromUser.email}</CardDescription>
                    </CardHeader>
                </Card>

                <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
                    <CardContent className="pt-6 text-sm text-green-950 dark:text-green-100">
                        После принятия автомобиль появится в вашем гараже. Вы
                        сможете просматривать всю историю и добавлять новые
                        записи.
                    </CardContent>
                </Card>

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
