<?php

namespace App\Enums;

enum Currency: string
{
    case RUB = 'RUB';
    case AMD = 'AMD';
    case KZT = 'KZT';
    case UAH = 'UAH';
    case BYN = 'BYN';
    case USD = 'USD';

    public function symbol(): string
    {
        return match ($this) {
            self::RUB => '₽',
            self::AMD => '֏',
            self::KZT => '₸',
            self::UAH => '₴',
            self::BYN => 'Br',
            self::USD => '$',
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::RUB => 'Российский рубль',
            self::AMD => 'Армянский драм',
            self::KZT => 'Казахстанский тенге',
            self::UAH => 'Украинская гривна',
            self::BYN => 'Белорусский рубль',
            self::USD => 'Доллар США',
        };
    }

    /**
     * @return list<array{id: string, symbol: string, label: string}>
     */
    public static function forFrontend(): array
    {
        return array_map(
            static fn (self $currency): array => [
                'id' => $currency->value,
                'symbol' => $currency->symbol(),
                'label' => $currency->label(),
            ],
            self::cases(),
        );
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
