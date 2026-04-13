<?php

namespace App\Enums;

enum CarTransferStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Cancelled = 'cancelled';

    /**
     * @return list<array{id: string}>
     */
    public static function forFrontend(): array
    {
        return array_map(
            static fn (self $status): array => [
                'id' => $status->value,
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
