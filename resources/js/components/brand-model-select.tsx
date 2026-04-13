import { ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { postJson } from '@/lib/csrf-fetch';
import { cn } from '@/lib/utils';
import { brands, generations, models, suggest } from '@/routes/car-catalog';

export type BrandModelPayload = {
    brand_id: number | null;
    brand_name: string;
    model_id: number | null;
    model_name: string;
};

type CatalogItem = { id: number; name: string };

type CatalogDefault = { id: number | null; name: string } | null;

export interface GenerationOption {
    id: number;
    name: string;
    gen: string | null;
    start_year: number | null;
    end_year: number | null;
    period: string;
    label: string;
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
    const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal,
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
}

export function BrandModelSelect({
    onBrandChange,
    onModelChange,
    onGenerationChange,
    defaultBrand = null,
    defaultModel = null,
    defaultGeneration = null,
}: {
    onBrandChange: (value: BrandModelPayload) => void;
    onModelChange: (value: BrandModelPayload) => void;
    onGenerationChange: (gen: GenerationOption | null) => void;
    defaultBrand?: CatalogDefault;
    defaultModel?: CatalogDefault;
    defaultGeneration?: GenerationOption | null;
}) {
    const [brandCatalog, setBrandCatalog] = React.useState<CatalogItem[]>([]);
    const [modelCatalog, setModelCatalog] = React.useState<CatalogItem[]>([]);
    const [generationCatalog, setGenerationCatalog] = React.useState<
        GenerationOption[]
    >([]);
    const [brandsLoading, setBrandsLoading] = React.useState(true);
    const [modelsLoading, setModelsLoading] = React.useState(false);
    const [generationsLoading, setGenerationsLoading] = React.useState(false);

    const [brandOpen, setBrandOpen] = React.useState(false);
    const [modelOpen, setModelOpen] = React.useState(false);
    const [generationOpen, setGenerationOpen] = React.useState(false);

    const [brandManual, setBrandManual] = React.useState(
        () =>
            Boolean(
                defaultBrand &&
                    defaultBrand.id === null &&
                    defaultBrand.name.trim() !== '',
            ),
    );
    const [modelManual, setModelManual] = React.useState(
        () =>
            Boolean(
                defaultModel &&
                    defaultModel.id === null &&
                    defaultModel.name.trim() !== '',
            ),
    );

    const [brandId, setBrandId] = React.useState<number | null>(
        defaultBrand?.id ?? null,
    );
    const [brandName, setBrandName] = React.useState(
        defaultBrand?.name ?? '',
    );
    const [modelId, setModelId] = React.useState<number | null>(
        defaultModel?.id ?? null,
    );
    const [modelName, setModelName] = React.useState(
        defaultModel?.name ?? '',
    );

    const [generation, setGeneration] = React.useState<GenerationOption | null>(
        defaultGeneration,
    );

    const [suggestingBrand, setSuggestingBrand] = React.useState(false);
    const [suggestingModel, setSuggestingModel] = React.useState(false);

    React.useEffect(() => {
        const controller = new AbortController();
        setBrandsLoading(true);

        fetchJson<CatalogItem[]>(brands.url(), controller.signal)
            .then((items) => setBrandCatalog(items))
            .catch(() => setBrandCatalog([]))
            .finally(() => setBrandsLoading(false));

        return () => controller.abort();
    }, []);

    React.useEffect(() => {
        if (!brandId || brandManual) {
            setModelCatalog([]);
            setModelsLoading(false);
            setGenerationCatalog([]);
            setGenerationsLoading(false);
            setGeneration(null);
            setGenerationOpen(false);
            onGenerationChange(null);

            return;
        }

        const controller = new AbortController();
        setModelsLoading(true);

        const url = models.url({ query: { brand_id: brandId } });
        fetchJson<CatalogItem[]>(url, controller.signal)
            .then((items) => setModelCatalog(items))
            .catch(() => setModelCatalog([]))
            .finally(() => setModelsLoading(false));

        return () => controller.abort();
    }, [brandId, brandManual, onGenerationChange]);

    React.useEffect(() => {
        if (!modelId || modelManual) {
            setGenerationCatalog([]);
            setGenerationsLoading(false);
            setGeneration(null);
            setGenerationOpen(false);
            onGenerationChange(null);

            return;
        }

        const controller = new AbortController();
        setGenerationsLoading(true);

        const url = generations.url({ query: { model_id: modelId } });
        fetchJson<GenerationOption[]>(url, controller.signal)
            .then((items) => {
                setGenerationCatalog(items);

                if (items.length === 0) {
                    setGeneration(null);
                    onGenerationChange(null);

                    return;
                }

                if (items.length === 1) {
                    setGeneration(items[0]);
                    onGenerationChange(items[0]);

                    return;
                }

                if (generation && items.some((i) => i.id === generation.id)) {
                    return;
                }

                setGeneration(null);
                onGenerationChange(null);
            })
            .catch(() => {
                setGenerationCatalog([]);
                setGeneration(null);
                onGenerationChange(null);
            })
            .finally(() => setGenerationsLoading(false));

        return () => controller.abort();
    }, [modelId, modelManual, generation, onGenerationChange]);

    const buildPayload = React.useCallback(
        (overrides: Partial<BrandModelPayload> = {}): BrandModelPayload => ({
            brand_id: brandId,
            brand_name: brandName,
            model_id: modelId,
            model_name: modelName,
            ...overrides,
        }),
        [brandId, brandName, modelId, modelName],
    );

    const modelStepDisabled =
        brandId === null && (!brandManual || brandName.trim() === '');

    const generationStepVisible =
        modelId !== null && !modelManual && (generationsLoading || generationCatalog.length > 0);

    function pickBrandFromCatalog(item: CatalogItem) {
        setBrandManual(false);
        setBrandId(item.id);
        setBrandName(item.name);
        setBrandOpen(false);
        setModelId(null);
        setModelName('');
        setModelManual(false);
        setModelOpen(false);
        setGenerationCatalog([]);
        setGenerationsLoading(false);
        setGeneration(null);
        setGenerationOpen(false);
        const payload = buildPayload({
            brand_id: item.id,
            brand_name: item.name,
            model_id: null,
            model_name: '',
        });
        onBrandChange(payload);
        onModelChange(payload);
        onGenerationChange(null);
    }

    function pickModelFromCatalog(item: CatalogItem) {
        setModelManual(false);
        setModelId(item.id);
        setModelName(item.name);
        setModelOpen(false);
        setGenerationCatalog([]);
        setGenerationsLoading(false);
        setGeneration(null);
        setGenerationOpen(false);
        const payload = buildPayload({
            model_id: item.id,
            model_name: item.name,
        });
        onModelChange(payload);
        onBrandChange(payload);
        onGenerationChange(null);
    }

    function pickGenerationFromCatalog(item: GenerationOption) {
        setGeneration(item);
        setGenerationOpen(false);
        onGenerationChange(item);
    }

    function switchBrandToManual() {
        setBrandOpen(false);
        setBrandManual(true);
        setBrandId(null);
        setBrandName('');
        setModelId(null);
        setModelName('');
        setModelManual(true);
        setGenerationCatalog([]);
        setGenerationsLoading(false);
        setGeneration(null);
        setGenerationOpen(false);
        const payload = buildPayload({
            brand_id: null,
            brand_name: '',
            model_id: null,
            model_name: '',
        });
        onBrandChange(payload);
        onModelChange(payload);
        onGenerationChange(null);
    }

    function switchModelToManual() {
        setModelOpen(false);
        setModelManual(true);
        setModelId(null);
        setGenerationCatalog([]);
        setGenerationsLoading(false);
        setGeneration(null);
        setGenerationOpen(false);
        const payload = buildPayload({ model_id: null });
        onModelChange(payload);
        onBrandChange(payload);
        onGenerationChange(null);
    }

    function switchBrandToCatalog() {
        setBrandManual(false);
        setBrandId(null);
        setBrandName('');
        setModelId(null);
        setModelName('');
        setModelManual(false);
        setGenerationCatalog([]);
        setGenerationsLoading(false);
        setGeneration(null);
        setGenerationOpen(false);
        const cleared = buildPayload({
            brand_id: null,
            brand_name: '',
            model_id: null,
            model_name: '',
        });
        onBrandChange(cleared);
        onModelChange(cleared);
        onGenerationChange(null);
    }

    function switchModelToCatalog() {
        setModelManual(false);
        setModelId(null);
        setModelName('');
        setGenerationCatalog([]);
        setGenerationsLoading(false);
        setGeneration(null);
        setGenerationOpen(false);
        const payload = buildPayload({ model_id: null, model_name: '' });
        onModelChange(payload);
        onBrandChange(payload);
        onGenerationChange(null);
    }

    async function submitSuggestion(
        type: 'brand' | 'model',
        name: string,
        selectedBrandId: number | null,
    ) {
        const trimmed = name.trim();

        if (!trimmed) {
            return;
        }

        if (type === 'model' && !selectedBrandId) {
            toast.error('Чтобы предложить модель, сначала выберите марку из списка.');

            return;
        }

        const setter = type === 'brand' ? setSuggestingBrand : setSuggestingModel;
        setter(true);

        try {
            const response = await postJson(suggest.url(), {
                type,
                name: trimmed,
                brand_id: selectedBrandId,
            });

            if (!response.ok) {
                throw new Error('request failed');
            }

            toast.success('Спасибо! Рассмотрим добавление');
        } catch {
            toast.error('Не удалось отправить предложение');
        } finally {
            setter(false);
        }
    }

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                    <Label>Марка</Label>
                    {brandManual ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={switchBrandToCatalog}
                        >
                            Выбрать из списка
                        </Button>
                    ) : null}
                </div>

                {!brandManual ? (
                    <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                aria-expanded={brandOpen}
                                disabled={brandsLoading}
                                className="h-11 w-full justify-between font-normal"
                            >
                                <span className="truncate">
                                    {brandName.trim()
                                        ? brandName
                                        : 'Выберите марку'}
                                </span>
                                {brandsLoading ? (
                                    <Spinner className="size-4" />
                                ) : (
                                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-[min(100vw-2rem,24rem)] p-0"
                            align="start"
                        >
                            <Command shouldFilter>
                                <CommandInput placeholder="Поиск марки…" />
                                <CommandList>
                                    <CommandEmpty>Ничего не найдено.</CommandEmpty>
                                    <CommandGroup heading="Марки">
                                        {brandCatalog.map((b) => (
                                            <CommandItem
                                                key={b.id}
                                                value={b.name}
                                                onSelect={() =>
                                                    pickBrandFromCatalog(b)
                                                }
                                            >
                                                {b.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup>
                                        <CommandItem
                                            value="__not_listed_brand"
                                            onSelect={switchBrandToManual}
                                        >
                                            Нет в списке
                                        </CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                ) : (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                            value={brandName}
                            onChange={(e) => {
                                const v = e.target.value;
                                setBrandName(v);
                                const payload = buildPayload({
                                    brand_id: null,
                                    brand_name: v,
                                });
                                onBrandChange(payload);
                                onModelChange(payload);
                            }}
                            placeholder="Введите марку"
                            autoComplete="off"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            className="shrink-0"
                            disabled={suggestingBrand || !brandName.trim()}
                            onClick={() =>
                                void submitSuggestion(
                                    'brand',
                                    brandName,
                                    null,
                                )
                            }
                        >
                            {suggestingBrand ? <Spinner /> : null}
                            Предложить
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                    <Label>Модель</Label>
                    {modelManual && !brandManual && !modelStepDisabled ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={switchModelToCatalog}
                        >
                            Выбрать из списка
                        </Button>
                    ) : null}
                </div>

                {brandManual || modelManual ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                            value={modelName}
                            disabled={modelStepDisabled}
                            onChange={(e) => {
                                const v = e.target.value;
                                setModelName(v);
                                const payload = buildPayload({
                                    model_id: null,
                                    model_name: v,
                                });
                                onModelChange(payload);
                                onBrandChange(payload);
                            }}
                            placeholder="Введите модель"
                            autoComplete="off"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            className="shrink-0"
                            disabled={
                                suggestingModel ||
                                !modelName.trim() ||
                                modelStepDisabled
                            }
                            onClick={() =>
                                void submitSuggestion(
                                    'model',
                                    modelName,
                                    brandId,
                                )
                            }
                        >
                            {suggestingModel ? <Spinner /> : null}
                            Предложить
                        </Button>
                    </div>
                ) : (
                    <Popover open={modelOpen} onOpenChange={setModelOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                aria-expanded={modelOpen}
                                disabled={modelStepDisabled || modelsLoading}
                                className={cn(
                                    'h-11 w-full justify-between font-normal',
                                    modelStepDisabled &&
                                        'pointer-events-none opacity-50',
                                )}
                            >
                                <span className="truncate">
                                    {modelName.trim()
                                        ? modelName
                                        : 'Выберите модель'}
                                </span>
                                {modelsLoading ? (
                                    <Spinner className="size-4" />
                                ) : (
                                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-[min(100vw-2rem,24rem)] p-0"
                            align="start"
                        >
                            <Command shouldFilter>
                                <CommandInput placeholder="Поиск модели…" />
                                <CommandList>
                                    <CommandEmpty>Ничего не найдено.</CommandEmpty>
                                    <CommandGroup heading="Модели">
                                        {modelCatalog.map((m) => (
                                            <CommandItem
                                                key={m.id}
                                                value={m.name}
                                                onSelect={() =>
                                                    pickModelFromCatalog(m)
                                                }
                                            >
                                                {m.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    <CommandSeparator />
                                    <CommandGroup>
                                        <CommandItem
                                            value="__not_listed_model"
                                            onSelect={switchModelToManual}
                                            disabled={modelStepDisabled}
                                        >
                                            Нет в списке
                                        </CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            </div>

            {generationStepVisible ? (
                <div className="grid gap-2">
                    <Label>Поколение</Label>

                    {generationCatalog.length === 1 && generationCatalog[0] ? (
                        <div className="flex h-11 items-center rounded-md border bg-muted/20 px-3 text-sm">
                            <div className="min-w-0">
                                <div className="truncate font-medium">
                                    {generationCatalog[0].name}
                                </div>
                                <div className="truncate text-sm text-muted-foreground">
                                    {generationCatalog[0].period}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Popover
                            open={generationOpen}
                            onOpenChange={setGenerationOpen}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={generationOpen}
                                    disabled={generationsLoading}
                                    className="h-11 w-full justify-between font-normal"
                                >
                                    <span className="truncate">
                                        {generation?.name
                                            ? generation.name
                                            : 'Выберите поколение'}
                                    </span>
                                    {generationsLoading ? (
                                        <Spinner className="size-4" />
                                    ) : (
                                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[min(100vw-2rem,24rem)] p-0"
                                align="start"
                            >
                                <Command shouldFilter>
                                    <CommandInput placeholder="Поиск поколения…" />
                                    <CommandList>
                                        <CommandEmpty>
                                            Ничего не найдено.
                                        </CommandEmpty>
                                        <CommandGroup heading="Поколения">
                                            {generationCatalog.map((g) => (
                                                <CommandItem
                                                    key={g.id}
                                                    value={g.label}
                                                    onSelect={() =>
                                                        pickGenerationFromCatalog(
                                                            g,
                                                        )
                                                    }
                                                >
                                                    <div className="min-w-0">
                                                        <div className="truncate">
                                                            {g.name}
                                                        </div>
                                                        <div className="truncate text-sm text-muted-foreground">
                                                            {g.period}
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            ) : null}
        </div>
    );
}
