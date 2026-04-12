export type CarColorId =
    | 'white'
    | 'black'
    | 'silver'
    | 'gray'
    | 'red'
    | 'blue'
    | 'electric_blue'
    | 'dark_blue'
    | 'green'
    | 'dark_green'
    | 'yellow'
    | 'orange'
    | 'brown'
    | 'beige'
    | 'purple'
    | 'gold'
    | 'champagne'
    | 'bordeaux';

export type CarColorMeta = {
    id: CarColorId;
    name: string;
    hex: string;
};

export const CAR_COLORS: readonly CarColorMeta[] = [
    { id: 'white', name: 'Белый', hex: '#F5F5F5' },
    { id: 'black', name: 'Чёрный', hex: '#1C1C1E' },
    { id: 'silver', name: 'Серебристый', hex: '#C0C0C0' },
    { id: 'gray', name: 'Серый', hex: '#808080' },
    { id: 'red', name: 'Красный', hex: '#C0392B' },
    { id: 'blue', name: 'Синий', hex: '#2980B9' },
    { id: 'electric_blue', name: 'Электро-синий', hex: '#0066CC' },
    { id: 'dark_blue', name: 'Тёмно-синий', hex: '#1A237E' },
    { id: 'green', name: 'Зелёный', hex: '#27AE60' },
    { id: 'dark_green', name: 'Тёмно-зелёный', hex: '#1B5E20' },
    { id: 'yellow', name: 'Жёлтый', hex: '#F1C40F' },
    { id: 'orange', name: 'Оранжевый', hex: '#E67E22' },
    { id: 'brown', name: 'Коричневый', hex: '#795548' },
    { id: 'beige', name: 'Бежевый', hex: '#D7CCC8' },
    { id: 'purple', name: 'Фиолетовый', hex: '#8E24AA' },
    { id: 'gold', name: 'Золотой', hex: '#D4AC0D' },
    { id: 'champagne', name: 'Шампань', hex: '#F7E7CE' },
    { id: 'bordeaux', name: 'Бордовый', hex: '#7B1F2E' },
] as const;

const BORDER_IDS = new Set<CarColorId>([
    'white',
    'champagne',
    'gold',
    'yellow',
]);

export function carColorNeedsBorder(id: CarColorId): boolean {
    return BORDER_IDS.has(id);
}

export function getCarColorMeta(
    id: string | null | undefined,
): CarColorMeta | undefined {
    if (!id) {
        return undefined;
    }

    return CAR_COLORS.find((c) => c.id === id);
}
