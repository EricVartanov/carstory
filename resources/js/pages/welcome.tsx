import { Head, Link } from '@inertiajs/react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { CarStoryMark } from '@/components/carstory-brand';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { login, register, welcome } from '@/routes';

type Stats = {
    cars: number;
    entries: number;
    transfers: number;
};

type WelcomeProps = {
    stats: Stats;
    canRegister?: boolean;
    siteUrl: string;
};

const heroContainer = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.1 },
    },
};

const heroItem = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 },
    },
};

function StatNumber({ value }: { value: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
    const motionValue = useMotionValue(0);
    const spring = useSpring(motionValue, { stiffness: 90, damping: 22 });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    useEffect(() => {
        return spring.on('change', (latest) => {
            setDisplay(Math.round(latest));
        });
    }, [spring]);

    return <span ref={ref}>{display}</span>;
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={
                isInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 28 }
            }
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
            <Card className="h-full border-border/80 bg-card/80 shadow-sm">
                <CardHeader>
                    <div className="mb-1 text-2xl" aria-hidden>
                        {icon}
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                        {description}
                    </CardDescription>
                </CardHeader>
            </Card>
        </motion.div>
    );
}

function SectionMotion({
    children,
    className,
    id,
}: {
    children: ReactNode;
    className?: string;
    id?: string;
}) {
    return (
        <motion.section
            id={id}
            className={className}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.section>
    );
}

export default function Welcome({
    stats,
    canRegister = true,
    siteUrl,
}: WelcomeProps) {
    const canonical = siteUrl;
    const year = new Date().getFullYear();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CaRStory',
        description:
            'Цифровой паспорт автомобиля. Ведите историю обслуживания и передайте при продаже.',
        url: siteUrl,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'RUB',
        },
    };

    return (
        <>
            <Head title="История вашего автомобиля">
                <meta
                    head-key="description"
                    name="description"
                    content="Ведите цифровой паспорт автомобиля. Записывайте обслуживание, поездки и расходы. Передайте историю при продаже. Бесплатно."
                />
                <meta
                    head-key="keywords"
                    name="keywords"
                    content="история автомобиля, сервисная книжка онлайн, паспорт автомобиля, обслуживание авто, продажа автомобиля"
                />
                <meta
                    head-key="og:title"
                    property="og:title"
                    content="CaRStory — История вашего автомобиля"
                />
                <meta
                    head-key="og:description"
                    property="og:description"
                    content="Цифровой паспорт для вашего автомобиля. Ведите историю, передайте при продаже."
                />
                <meta head-key="og:type" property="og:type" content="website" />
                <meta head-key="og:url" property="og:url" content={canonical} />
                <meta
                    head-key="twitter:card"
                    name="twitter:card"
                    content="summary_large_image"
                />
                <meta head-key="robots" name="robots" content="index, follow" />
                <link rel="canonical" href={canonical} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(jsonLd),
                    }}
                />
            </Head>

            <div className="relative min-h-svh bg-background text-foreground">
                <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
                        <Link
                            href={welcome().url}
                            className="inline-flex shrink-0 items-center rounded-md bg-zinc-950 p-1.5 ring-1 ring-border/60"
                        >
                            <CarStoryMark
                                className="max-h-8"
                                alt="CarStory"
                            />
                        </Link>
                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            <ThemeToggle />
                            <Button variant="secondary" size="sm" asChild>
                                <Link href={login().url}>Войти</Link>
                            </Button>
                            {canRegister ? (
                                <Button size="sm" asChild>
                                    <Link href={register().url}>
                                        Начать бесплатно
                                    </Link>
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </header>

                <div className="overflow-x-hidden">
                <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
                    <div
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--brand-blue)/0.15),transparent_60%)]"
                        aria-hidden
                    />
                    <div className="relative mx-auto max-w-3xl text-center">
                        <motion.div
                            variants={heroContainer}
                            initial="hidden"
                            animate="show"
                            className="flex flex-col items-center gap-5"
                        >
                            <motion.div variants={heroItem}>
                                <Badge
                                    variant="secondary"
                                    className="border-brand-blue/25 bg-brand-blue-light/40 px-3 py-1 text-xs font-medium text-foreground dark:bg-brand-blue/15"
                                >
                                    Цифровой паспорт автомобиля
                                </Badge>
                            </motion.div>
                            <motion.h1
                                variants={heroItem}
                                className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl"
                            >
                                Каждый километр заслуживает памяти
                            </motion.h1>
                            <motion.p
                                variants={heroItem}
                                className="text-muted-foreground max-w-xl text-pretty text-base leading-relaxed sm:text-lg"
                            >
                                Ведите историю обслуживания, поездок и расходов.
                                При продаже — передайте всё новому владельцу одной
                                ссылкой.
                            </motion.p>
                            <motion.div
                                variants={heroItem}
                                className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-center"
                            >
                                {canRegister ? (
                                    <Button size="lg" asChild>
                                        <Link href={register().url}>
                                            Создать гараж бесплатно
                                        </Link>
                                    </Button>
                                ) : null}
                                <Button size="lg" variant="outline" asChild>
                                    <a href="#preview">Посмотреть как работает</a>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                <SectionMotion className="border-border/60 border-y bg-muted/30 px-4 py-12 sm:px-6">
                    <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3 sm:gap-6">
                        {[
                            {
                                emoji: '🚗',
                                label: 'автомобилей',
                                value: stats.cars,
                            },
                            {
                                emoji: '📋',
                                label: 'записей',
                                value: stats.entries,
                            },
                            {
                                emoji: '🔄',
                                label: 'передач',
                                value: stats.transfers,
                            },
                        ].map((item) => (
                            <Card
                                key={item.label}
                                className="border-border/80 text-center shadow-sm"
                            >
                                <CardContent className="pt-6 pb-6">
                                    <div className="mb-2 text-3xl" aria-hidden>
                                        {item.emoji}
                                    </div>
                                    <p className="text-brand-blue text-3xl font-semibold tabular-nums sm:text-4xl">
                                        <StatNumber value={item.value} />+
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        {item.label}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </SectionMotion>

                <SectionMotion
                    id="preview"
                    className="scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20"
                >
                    <div className="mx-auto max-w-lg">
                        <p className="text-muted-foreground mb-6 text-center text-sm font-medium uppercase tracking-wide">
                            Как это выглядит
                        </p>
                        <Card className="overflow-hidden border-zinc-700 bg-zinc-950 text-zinc-100 shadow-xl dark:border-zinc-800">
                            <div className="relative h-28 bg-gradient-to-br from-brand-blue via-blue-600 to-indigo-900">
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.45))]" />
                                <div className="relative flex h-full flex-col justify-end p-4">
                                    <p className="text-xs font-medium text-white/80">
                                        Ваш гараж
                                    </p>
                                    <p className="text-lg font-semibold text-white">
                                        BMW 320d
                                    </p>
                                    <p className="text-sm text-white/75">
                                        142 500 км
                                    </p>
                                </div>
                            </div>
                            <CardContent className="space-y-0 divide-y divide-zinc-800 p-0">
                                {[
                                    {
                                        tag: 'Обслуживание',
                                        title: 'Замена масла и фильтра',
                                        sub: '12 марта · 142 200 км',
                                    },
                                    {
                                        tag: 'Поездка',
                                        title: 'Калининград и обратно',
                                        sub: '820 км · март',
                                    },
                                    {
                                        tag: 'Заправка',
                                        title: 'ДТ, Лукойл',
                                        sub: '45 л · 3 240 ₽',
                                    },
                                ].map((row) => (
                                    <div
                                        key={row.title}
                                        className="flex gap-3 px-4 py-3.5"
                                    >
                                        <div className="bg-brand-blue/20 text-primary mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold">
                                            {row.tag.slice(0, 2)}
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <p className="text-muted-foreground text-xs">
                                                {row.tag}
                                            </p>
                                            <p className="truncate font-medium">
                                                {row.title}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {row.sub}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </SectionMotion>

                <SectionMotion className="px-4 py-14 sm:px-6 sm:py-20">
                    <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 sm:gap-6">
                        <FeatureCard
                            icon="📋"
                            title="История записей"
                            description="Обслуживание, поездки, расходы и фото в одном месте"
                        />
                        <FeatureCard
                            icon="🔄"
                            title="Передача при продаже"
                            description="QR-код или ссылка. Новый владелец продолжает историю"
                        />
                        <FeatureCard
                            icon="📍"
                            title="Места поездок"
                            description="Отмечайте где побывали на карте"
                        />
                        <FeatureCard
                            icon="📱"
                            title="Работает как приложение"
                            description="Установите на телефон без App Store"
                        />
                    </div>
                </SectionMotion>

                <SectionMotion className="px-4 pb-14 sm:px-6 sm:pb-20">
                    <div className="mx-auto max-w-4xl rounded-2xl border border-brand-blue/20 bg-gradient-to-br from-brand-blue/10 via-background to-background p-6 sm:p-10">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Продаёте автомобиль?
                        </h2>
                        <p className="text-muted-foreground mt-4 max-w-2xl text-pretty leading-relaxed">
                            Покупатели б/у машин хотят знать её историю. CaRStory
                            позволяет передать полный цифровой паспорт — все записи,
                            фото и документы — одной ссылкой или QR-кодом. Ваши
                            записи останутся доступны для просмотра.
                        </p>
                        <motion.div
                            className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm font-medium sm:gap-6"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.15, duration: 0.4 }}
                        >
                            <span className="bg-card text-foreground rounded-full border px-4 py-2 shadow-sm">
                                Вы
                            </span>
                            <span className="text-muted-foreground" aria-hidden>
                                →
                            </span>
                            <span className="bg-card text-foreground rounded-full border px-4 py-2 shadow-sm">
                                Новый владелец
                            </span>
                        </motion.div>
                    </div>
                </SectionMotion>

                <SectionMotion className="bg-muted/20 px-4 py-14 sm:px-6 sm:py-20">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="mb-2 text-center text-2xl font-semibold sm:text-3xl">
                            Вопросы и ответы
                        </h2>
                        <p className="text-muted-foreground mb-8 text-center text-sm">
                            Коротко о том, как устроен CaRStory
                        </p>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="free">
                                <AccordionTrigger>
                                    Это бесплатно?
                                </AccordionTrigger>
                                <AccordionContent>
                                    Да, CaRStory полностью бесплатен. Создавайте
                                    гараж, добавляйте машины и ведите историю без
                                    ограничений.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="transfer">
                                <AccordionTrigger>
                                    Как передать машину новому владельцу?
                                </AccordionTrigger>
                                <AccordionContent>
                                    В профиле машины нажмите «Передать машину».
                                    Система сгенерирует уникальную ссылку и QR-код.
                                    Отправьте новому владельцу любым удобным
                                    способом — через мессенджер или на email.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="visibility">
                                <AccordionTrigger>
                                    Увидит ли новый владелец мои записи?
                                </AccordionTrigger>
                                <AccordionContent>
                                    Да. Новый владелец видит всю историю машины
                                    включая ваши записи, но не может их редактировать
                                    или удалять — только добавлять новые.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="app">
                                <AccordionTrigger>
                                    Нужно ли скачивать приложение?
                                </AccordionTrigger>
                                <AccordionContent>
                                    Нет. CaRStory работает прямо в браузере телефона.
                                    При желании можно установить на экран как
                                    приложение — без App Store и Google Play.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="security">
                                <AccordionTrigger>
                                    Мои данные в безопасности?
                                </AccordionTrigger>
                                <AccordionContent>
                                    Все данные хранятся на защищённых серверах.
                                    Никто кроме вас не имеет доступа к истории вашего
                                    автомобиля.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </SectionMotion>

                <SectionMotion className="px-4 pb-16 pt-4 sm:px-6">
                    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                        <h2 className="text-2xl font-semibold">
                            Начните прямо сейчас
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                            Бесплатно. Без приложения. Работает на любом телефоне.
                        </p>
                        {canRegister ? (
                            <Button className="mt-6" size="lg" asChild>
                                <Link href={register().url}>Создать гараж</Link>
                            </Button>
                        ) : (
                            <Button className="mt-6" size="lg" asChild>
                                <Link href={login().url}>Войти</Link>
                            </Button>
                        )}
                    </div>
                </SectionMotion>

                <footer className="border-t border-border px-4 py-10 sm:px-6">
                    <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
                        <div>
                            <p className="flex justify-center text-lg font-semibold sm:justify-start">
                                <span className="inline-flex rounded-md bg-zinc-950 p-1.5 ring-1 ring-border/60">
                                    <CarStoryMark
                                        className="max-h-8"
                                        alt="CarStory"
                                    />
                                </span>
                            </p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                © {year} CaRStory
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 text-sm">
                            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 sm:justify-end">
                                <Link
                                    className="text-primary hover:underline"
                                    href={login().url}
                                >
                                    Войти
                                </Link>
                                {canRegister ? (
                                    <>
                                        <span
                                            className="text-muted-foreground"
                                            aria-hidden
                                        >
                                            ·
                                        </span>
                                        <Link
                                            className="text-primary hover:underline"
                                            href={register().url}
                                        >
                                            Регистрация
                                        </Link>
                                    </>
                                ) : null}
                            </div>
                            <p className="text-muted-foreground text-xs">
                                Сделано с ❤️ для автолюбителей
                            </p>
                        </div>
                    </div>
                </footer>
                </div>
            </div>
        </>
    );
}
