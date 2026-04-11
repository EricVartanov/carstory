export const CURRENCIES = ['RUB', 'AMD', 'KZT', 'UAH', 'BYN', 'USD'] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

/**
 * Формат DD.MM.YYYY (для ISO-строк и Date).
 */
export function formatDateRu(value: string | Date | null | undefined): string {
    if (!value) {
        return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

export const DISTANCE_UNIT = 'км';

/**
 * Формат пробега: 25000 -> "25 000 км".
 */
export function formatMileageRu(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return '';
    }

    const asNumber = Number(value);
    if (!Number.isFinite(asNumber)) {
        return '';
    }

    const formatted = new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 0,
    }).format(asNumber);

    return `${formatted} ${DISTANCE_UNIT}`;
}

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
    RUB: '₽',
    AMD: '֏',
    KZT: '₸',
    UAH: '₴',
    BYN: 'Br',
    USD: '$',
};

/**
 * Формат денег: 3000 -> "3 000 ₽".
 */
export function formatMoneyRu(
    amount: string | number | null | undefined,
    currency: CurrencyCode,
): string {
    if (amount === null || amount === undefined || amount === '') {
        return '';
    }

    const asNumber = typeof amount === 'string' ? Number(amount) : amount;
    if (!Number.isFinite(asNumber)) {
        return '';
    }

    const formatted = new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(asNumber);

    return `${formatted} ${CURRENCY_SYMBOLS[currency]}`;
}
