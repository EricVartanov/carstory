import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { brands, models } from '@/routes/car-catalog';

type CatalogItem = {
    id: number;
    name: string;
};

type InitialValue = CatalogItem | string | null | undefined;

function normalizeInitialValue(value: InitialValue): {
    selected: CatalogItem | null;
    text: string;
    isManual: boolean;
} {
    if (value === null || value === undefined) {
        return { selected: null, text: '', isManual: false };
    }

    if (typeof value === 'string') {
        return {
            selected: null,
            text: value,
            isManual: value.trim().length > 0,
        };
    }

    return { selected: value, text: value.name, isManual: false };
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
    const [debounced, setDebounced] = React.useState<T>(value);

    React.useEffect(() => {
        const id = window.setTimeout(() => setDebounced(value), delayMs);
        return () => window.clearTimeout(id);
    }, [value, delayMs]);

    return debounced;
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
        signal,
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
}

export function CarAutocomplete({
    onBrandSelect,
    onModelSelect,
    initialBrand,
    initialModel,
}: {
    onBrandSelect: (
        brand: CatalogItem | null,
        meta: { isManual: boolean; text: string },
    ) => void;
    onModelSelect: (
        model: CatalogItem | null,
        meta: { isManual: boolean; text: string },
    ) => void;
    initialBrand?: InitialValue;
    initialModel?: InitialValue;
}) {
    const initialBrandNormalized = React.useMemo(
        () => normalizeInitialValue(initialBrand),
        [initialBrand],
    );
    const initialModelNormalized = React.useMemo(
        () => normalizeInitialValue(initialModel),
        [initialModel],
    );

    const [brandText, setBrandText] = React.useState(
        initialBrandNormalized.text,
    );
    const [modelText, setModelText] = React.useState(
        initialModelNormalized.text,
    );

    const [selectedBrand, setSelectedBrand] =
        React.useState<CatalogItem | null>(initialBrandNormalized.selected);
    const [selectedModel, setSelectedModel] =
        React.useState<CatalogItem | null>(initialModelNormalized.selected);

    const [brandManual, setBrandManual] = React.useState(
        initialBrandNormalized.isManual,
    );
    const [modelManual, setModelManual] = React.useState(
        initialModelNormalized.isManual,
    );

    const [brandOpen, setBrandOpen] = React.useState(false);
    const [modelOpen, setModelOpen] = React.useState(false);

    const [brandLoading, setBrandLoading] = React.useState(false);
    const [modelLoading, setModelLoading] = React.useState(false);

    const [brandResults, setBrandResults] = React.useState<CatalogItem[]>([]);
    const [modelResults, setModelResults] = React.useState<CatalogItem[]>([]);

    const debouncedBrandText = useDebouncedValue(brandText, 300);
    const debouncedModelText = useDebouncedValue(modelText, 300);

    React.useEffect(() => {
        onBrandSelect(selectedBrand, {
            isManual: brandManual,
            text: brandText,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBrand, brandManual]);

    React.useEffect(() => {
        onModelSelect(selectedModel, {
            isManual: modelManual,
            text: modelText,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedModel, modelManual]);

    React.useEffect(() => {
        if (brandManual) {
            setBrandResults([]);
            setBrandLoading(false);
            return;
        }

        if (debouncedBrandText.trim().length < 2) {
            setBrandResults([]);
            setBrandLoading(false);
            return;
        }

        const controller = new AbortController();
        setBrandLoading(true);

        const url = brands.url({
            query: { search: debouncedBrandText.trim() },
        });
        fetchJson<CatalogItem[]>(url, controller.signal)
            .then((items) => {
                setBrandResults(items);
            })
            .catch(() => {
                setBrandResults([]);
            })
            .finally(() => {
                setBrandLoading(false);
            });

        return () => controller.abort();
    }, [debouncedBrandText, brandManual]);

    React.useEffect(() => {
        if (modelManual) {
            setModelResults([]);
            setModelLoading(false);
            return;
        }

        if (!selectedBrand) {
            setModelResults([]);
            setModelLoading(false);
            return;
        }

        if (debouncedModelText.trim().length < 2) {
            setModelResults([]);
            setModelLoading(false);
            return;
        }

        const controller = new AbortController();
        setModelLoading(true);

        const url = models.url({
            query: {
                brand_id: selectedBrand.id,
                search: debouncedModelText.trim(),
            },
        });

        fetchJson<CatalogItem[]>(url, controller.signal)
            .then((items) => {
                setModelResults(items);
            })
            .catch(() => {
                setModelResults([]);
            })
            .finally(() => {
                setModelLoading(false);
            });

        return () => controller.abort();
    }, [debouncedModelText, modelManual, selectedBrand]);

    function selectBrand(brand: CatalogItem) {
        setSelectedBrand(brand);
        setBrandText(brand.name);
        setBrandOpen(false);
        setBrandManual(false);

        setSelectedModel(null);
        setModelText('');
        setModelResults([]);
        setModelManual(false);
    }

    function selectModel(model: CatalogItem) {
        setSelectedModel(model);
        setModelText(model.name);
        setModelOpen(false);
        setModelManual(false);
    }

    const modelDisabled = !selectedBrand && !brandManual;

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="car_brand_autocomplete">Марка</Label>
                    {!brandManual ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setBrandManual(true)}
                        >
                            Ввести вручную
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setBrandManual(false);
                                setSelectedBrand(null);
                                setBrandText('');
                                setBrandResults([]);
                                setBrandOpen(false);

                                setSelectedModel(null);
                                setModelText('');
                                setModelResults([]);
                                setModelManual(false);
                            }}
                        >
                            Выбрать из списка
                        </Button>
                    )}
                </div>

                <div className="relative">
                    <Input
                        id="car_brand_autocomplete"
                        value={brandText}
                        onChange={(e) => {
                            setBrandText(e.target.value);
                            setSelectedBrand(null);
                            if (!brandManual) {
                                setBrandOpen(true);
                            }
                        }}
                        onFocus={() => {
                            if (!brandManual) {
                                setBrandOpen(true);
                            }
                        }}
                        onBlur={() => {
                            window.setTimeout(() => setBrandOpen(false), 120);
                        }}
                        placeholder="Например: Toyota"
                        autoComplete="off"
                    />

                    {brandLoading && (
                        <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                            <Spinner />
                        </div>
                    )}

                    {brandOpen && !brandManual && brandResults.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-background shadow-sm">
                            <ul className="max-h-64 overflow-auto py-1 text-sm">
                                {brandResults.map((b) => (
                                    <li key={b.id}>
                                        <button
                                            type="button"
                                            className="w-full px-3 py-2 text-left hover:bg-muted"
                                            onMouseDown={(e) =>
                                                e.preventDefault()
                                            }
                                            onClick={() => selectBrand(b)}
                                        >
                                            {b.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="car_model_autocomplete">Модель</Label>
                    {!modelManual ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={modelDisabled}
                            onClick={() => setModelManual(true)}
                        >
                            Ввести вручную
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={modelDisabled}
                            onClick={() => {
                                setModelManual(false);
                                setSelectedModel(null);
                                setModelText('');
                                setModelResults([]);
                                setModelOpen(false);
                            }}
                        >
                            Выбрать из списка
                        </Button>
                    )}
                </div>

                <div className="relative">
                    <Input
                        id="car_model_autocomplete"
                        value={modelText}
                        disabled={modelDisabled}
                        onChange={(e) => {
                            setModelText(e.target.value);
                            setSelectedModel(null);
                            if (!modelManual) {
                                setModelOpen(true);
                            }
                        }}
                        onFocus={() => {
                            if (!modelManual) {
                                setModelOpen(true);
                            }
                        }}
                        onBlur={() => {
                            window.setTimeout(() => setModelOpen(false), 120);
                        }}
                        placeholder={
                            modelDisabled
                                ? 'Сначала выберите марку'
                                : 'Например: Camry'
                        }
                        autoComplete="off"
                    />

                    {modelLoading && (
                        <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                            <Spinner />
                        </div>
                    )}

                    {modelOpen &&
                        !modelManual &&
                        modelResults.length > 0 &&
                        !modelDisabled && (
                            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-background shadow-sm">
                                <ul className="max-h-64 overflow-auto py-1 text-sm">
                                    {modelResults.map((m) => (
                                        <li key={m.id}>
                                            <button
                                                type="button"
                                                className="w-full px-3 py-2 text-left hover:bg-muted"
                                                onMouseDown={(e) =>
                                                    e.preventDefault()
                                                }
                                                onClick={() => selectModel(m)}
                                            >
                                                {m.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}
