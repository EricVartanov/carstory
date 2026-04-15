<?php

namespace App\Console\Commands;

use App\Services\Images\TempImageStorage;
use Illuminate\Console\Command;

class CleanupTempImages extends Command
{
    protected $signature = 'images:cleanup-temp';

    protected $description = 'Clean up temporary uploaded images';

    public function handle(TempImageStorage $tempImageStorage): int
    {
        $deleted = $tempImageStorage->cleanupOlderThan(3600);

        $this->info("Temp images cleaned: {$deleted}");

        return self::SUCCESS;
    }
}

