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

