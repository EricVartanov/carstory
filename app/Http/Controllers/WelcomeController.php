<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\CarTransfer;
use App\Models\Entry;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class WelcomeController extends Controller
{
    public function index(): RedirectResponse|Response
    {
        if (auth()->check()) {
            return redirect()->route('garage.index');
        }

        $siteUrl = rtrim((string) config('app.url'), '/');

        return Inertia::render('welcome', [
            'stats' => [
                'cars' => Car::count(),
                'entries' => Entry::count(),
                'transfers' => CarTransfer::where('status', 'accepted')->count(),
            ],
            'canRegister' => Features::enabled(Features::registration()),
            'siteUrl' => $siteUrl,
        ]);
    }
}
