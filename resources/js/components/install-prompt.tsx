import { Share } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type ChromiumInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'pwa-install-dismissed';

function isDismissed(): boolean {
    try {
        return localStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
        return false;
    }
}

function setDismissed(): void {
    try {
        localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
        //
    }
}

function isIos(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
    const standalone = (navigator as Navigator & { standalone?: boolean }).standalone;

    if (standalone === true) {
        return true;
    }

    return window.matchMedia('(display-mode: standalone)').matches;
}

export default function InstallPrompt(): React.ReactNode {
    const [deferredPrompt, setDeferredPrompt] = useState<ChromiumInstallPromptEvent | null>(null);
    const [showIos, setShowIos] = useState(false);
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (isDismissed() || isStandalone()) {
            return;
        }

        if (isIos()) {
            const frameId = requestAnimationFrame(() => {
                setShowIos(true);
                setActive(true);
            });

            return () => {
                cancelAnimationFrame(frameId);
            };
        }

        const onBeforeInstallPrompt = (event: Event): void => {
            event.preventDefault();
            setDeferredPrompt(event as ChromiumInstallPromptEvent);
            setActive(true);
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
        };
    }, []);

    const handleDismiss = useCallback(() => {
        setDismissed();
        setDeferredPrompt(null);
        setShowIos(false);
        setActive(false);
    }, []);

    const handleInstall = useCallback(async () => {
        if (!deferredPrompt) {
            return;
        }

        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;

        setDeferredPrompt(null);
        setActive(false);
    }, [deferredPrompt]);

    if (!active) {
        return null;
    }

    if (showIos) {
        return (
            <div
                className="animate-in slide-in-from-bottom-4 fade-in-0 fixed inset-x-0 bottom-0 z-50 duration-300"
                role="dialog"
                aria-label="Установка приложения"
            >
                <div className="border-border bg-zinc-900 text-white shadow-lg">
                    <div className="mx-auto flex max-w-lg items-start gap-3 p-4">
                        <p className="min-w-0 flex-1 text-sm leading-relaxed">
                            Нажмите{' '}
                            <Share
                                className="mx-0.5 inline-block size-4 shrink-0 align-text-bottom text-white"
                                aria-hidden
                            />{' '}
                            и выберите «На экран «Домой»»
                        </p>
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="shrink-0 rounded-md p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                            aria-label="Закрыть"
                        >
                            ×
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!deferredPrompt) {
        return null;
    }

    return (
        <div
            className="animate-in slide-in-from-bottom-4 fade-in-0 fixed inset-x-0 bottom-0 z-50 duration-300"
            role="dialog"
            aria-label="Установка CaRStory"
        >
            <div className="border-border bg-zinc-900 text-white shadow-lg">
                <div className="mx-auto flex max-w-lg flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm">Установить CaRStory на главный экран</p>
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            onClick={handleInstall}
                            className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
                        >
                            Установить
                        </button>
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                            aria-label="Закрыть"
                        >
                            ×
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
