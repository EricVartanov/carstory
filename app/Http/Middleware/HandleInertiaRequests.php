<?php

namespace App\Http\Middleware;

use App\Enums\CarColor;
use App\Enums\CarTransferStatus;
use App\Enums\Currency;
use App\Enums\EntryType;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'enums' => [
                'carColors' => CarColor::forFrontend(),
                'entryTypes' => EntryType::forFrontend(),
                'currencies' => Currency::forFrontend(),
                'transferStatuses' => CarTransferStatus::forFrontend(),
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
