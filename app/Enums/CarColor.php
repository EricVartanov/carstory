<?php

namespace App\Enums;

enum CarColor: string
{
    case White = 'white';
    case Black = 'black';
    case Silver = 'silver';
    case Gray = 'gray';
    case Red = 'red';
    case Blue = 'blue';
    case ElectricBlue = 'electric_blue';
    case DarkBlue = 'dark_blue';
    case Green = 'green';
    case DarkGreen = 'dark_green';
    case Yellow = 'yellow';
    case Orange = 'orange';
    case Brown = 'brown';
    case Beige = 'beige';
    case Purple = 'purple';
    case Gold = 'gold';
    case Champagne = 'champagne';
    case Bordeaux = 'bordeaux';

    public function label(): string
    {
        return match ($this) {
            self::White => 'Белый',
            self::Black => 'Чёрный',
            self::Silver => 'Серебристый',
            self::Gray => 'Серый',
            self::Red => 'Красный',
            self::Blue => 'Синий',
            self::ElectricBlue => 'Электро-синий',
            self::DarkBlue => 'Тёмно-синий',
            self::Green => 'Зелёный',
            self::DarkGreen => 'Тёмно-зелёный',
            self::Yellow => 'Жёлтый',
            self::Orange => 'Оранжевый',
            self::Brown => 'Коричневый',
            self::Beige => 'Бежевый',
            self::Purple => 'Фиолетовый',
            self::Gold => 'Золотой',
            self::Champagne => 'Шампань',
            self::Bordeaux => 'Бордовый',
        };
    }

    public function hex(): string
    {
        return match ($this) {
            self::White => '#F5F5F5',
            self::Black => '#1C1C1E',
            self::Silver => '#C0C0C0',
            self::Gray => '#808080',
            self::Red => '#C0392B',
            self::Blue => '#2980B9',
            self::ElectricBlue => '#0066CC',
            self::DarkBlue => '#1A237E',
            self::Green => '#27AE60',
            self::DarkGreen => '#1B5E20',
            self::Yellow => '#F1C40F',
            self::Orange => '#E67E22',
            self::Brown => '#795548',
            self::Beige => '#D7CCC8',
            self::Purple => '#8E24AA',
            self::Gold => '#D4AC0D',
            self::Champagne => '#F7E7CE',
            self::Bordeaux => '#7B1F2E',
        };
    }

    public function needsBorder(): bool
    {
        return in_array($this, [
            self::White,
            self::Silver,
            self::Beige,
            self::Champagne,
            self::Yellow,
            self::Gold,
        ], true);
    }

    /**
     * @return list<array{id: string, name: string, hex: string, needsBorder: bool}>
     */
    public static function forFrontend(): array
    {
        return array_map(
            static fn (self $color): array => [
                'id' => $color->value,
                'name' => $color->label(),
                'hex' => $color->hex(),
                'needsBorder' => $color->needsBorder(),
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
