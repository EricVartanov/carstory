import { Form, Head, Link } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { User } from '@/types';

type ProfileStats = {
    total_cars: number;
    previous_cars: number;
    total_entries: number;
};

export default function Profile({
    user,
    stats,
    mustVerifyEmail,
    status,
}: {
    user: User;
    stats: ProfileStats;
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const statCards = [
        {
            emoji: '🚗',
            label: 'Автомобилей',
            value: stats.total_cars,
        },
        {
            emoji: '📋',
            label: 'Записей',
            value: stats.total_entries,
        },
        {
            emoji: '🔄',
            label: 'Продано',
            value: stats.previous_cars,
        },
    ] as const;

    return (
        <>
            <Head title="Профиль" />

            <h1 className="sr-only">Профиль</h1>

            <section
                aria-label="Статистика"
                className="grid grid-cols-3 gap-2 sm:gap-3"
            >
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-zinc-900/70 px-2 py-4 text-center shadow-sm sm:px-3 dark:bg-zinc-950/80"
                    >
                        <span className="text-lg sm:text-xl" aria-hidden>
                            {card.emoji}
                        </span>
                        <p className="mt-1 tabular-nums text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                            {card.value}
                        </p>
                        <p className="mt-0.5 max-w-full truncate text-[10px] font-medium text-zinc-400 sm:text-xs">
                            {card.label}
                        </p>
                    </div>
                ))}
            </section>

            <div className="mt-10 space-y-12">
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Профиль"
                        description="Измените имя и адрес электронной почты"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Имя</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Ваше имя"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Электронная почта
                                    </Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="email@example.com"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Почта не подтверждена.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Нажмите здесь, чтобы
                                                    отправить письмо ещё раз.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    Новая ссылка для
                                                    подтверждения отправлена на
                                                    вашу почту.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Сохранить
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Пароль"
                        description="Измените пароль для входа в аккаунт"
                    />

                    <Form
                        {...SecurityController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">
                                        Текущий пароль
                                    </Label>

                                    <PasswordInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        className="mt-1 block w-full"
                                        autoComplete="current-password"
                                        placeholder="Текущий пароль"
                                    />

                                    <InputError
                                        message={errors.current_password}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        Новый пароль
                                    </Label>

                                    <PasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder="Новый пароль"
                                    />

                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Подтверждение пароля
                                    </Label>

                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder="Повторите пароль"
                                    />

                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-password-button"
                                    >
                                        Сохранить пароль
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Профиль',
            href: edit(),
        },
    ],
};
