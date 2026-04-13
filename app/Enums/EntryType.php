<?php

namespace App\Enums;

enum EntryType: string
{
    case Note = 'note';
    case Service = 'service';
    case Trip = 'trip';
    case Fuel = 'fuel';

    public function label(): string
    {
        return match ($this) {
            self::Note => 'Заметка',
            self::Service => 'Обслуживание',
            self::Trip => 'Поездка',
            self::Fuel => 'Заправка',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::Note => 'FileText',
            self::Service => 'Wrench',
            self::Trip => 'Car',
            self::Fuel => 'Fuel',
        };
    }

    /**
     * @return list<array{id: string, label: string, icon: string}>
     */
    public static function forFrontend(): array
    {
        return array_map(
            static fn (self $type): array => [
                'id' => $type->value,
                'label' => $type->label(),
                'icon' => $type->icon(),
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
