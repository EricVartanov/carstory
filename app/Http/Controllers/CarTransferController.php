<?php

namespace App\Http\Controllers;

use App\Enums\CarTransferStatus;
use App\Mail\TransferInvitation;
use App\Models\Car;
use App\Models\CarOwnership;
use App\Models\CarTransfer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CarTransferController extends Controller
{
    public function create(Car $car): Response
    {
        abort_unless($car->user_id === auth()->id(), 403);

        $transfer = $this->firstOrCreatePendingTransfer($car);

        $transferUrl = route('transfer.accept', ['token' => $transfer->token]);

        return Inertia::render('transfer/show', [
            'car' => $car->only(['id', 'brand', 'model', 'year']),
            'transfer' => [
                'id' => $transfer->id,
                'token' => $transfer->token,
                'status' => $transfer->status->value,
                'expires_at' => $transfer->expires_at?->toIso8601String(),
            ],
            'transferUrl' => $transferUrl,
        ]);
    }

    public function sendEmail(Request $request, Car $car): RedirectResponse
    {
        abort_unless($car->user_id === auth()->id(), 403);

        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $transfer = $this->firstOrCreatePendingTransfer($car);
        $transferUrl = route('transfer.accept', ['token' => $transfer->token]);

        Mail::to($validated['email'])->queue(new TransferInvitation($transfer, $transferUrl));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Письмо отправлено на '.$validated['email'],
        ]);

        return back();
    }

    public function accept(string $token): RedirectResponse|Response
    {
        $transfer = CarTransfer::query()
            ->where('token', $token)
            ->where('status', CarTransferStatus::Pending->value)
            ->first();

        if ($transfer === null) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Ссылка недействительна',
            ]);

            return to_route('garage.index');
        }

        if ($transfer->expires_at !== null && $transfer->expires_at->isPast()) {
            $transfer->update(['status' => CarTransferStatus::Cancelled->value]);

            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Ссылка истекла. Попросите владельца создать новую.',
            ]);

            return to_route('garage.index');
        }

        if ($transfer->from_user_id === auth()->id()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Нельзя принять собственную передачу',
            ]);

            return to_route('garage.index');
        }

        $transfer->load(['car', 'fromUser']);

        return Inertia::render('transfer/accept', [
            'transfer' => [
                'id' => $transfer->id,
                'car' => $transfer->car->only(['id', 'brand', 'model', 'year']),
                'from_user' => [
                    'email' => $transfer->fromUser->email,
                ],
            ],
            'token' => $token,
        ]);
    }

    public function confirm(string $token): RedirectResponse
    {
        return DB::transaction(function () use ($token): RedirectResponse {
            $transfer = CarTransfer::query()
                ->where('token', $token)
                ->where('status', CarTransferStatus::Pending->value)
                ->lockForUpdate()
                ->first();

            if ($transfer === null) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'Ссылка недействительна',
                ]);

                return to_route('garage.index');
            }

            if ($transfer->expires_at !== null && $transfer->expires_at->isPast()) {
                $transfer->update(['status' => CarTransferStatus::Cancelled->value]);

                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'Ссылка истекла. Попросите владельца создать новую.',
                ]);

                return to_route('garage.index');
            }

            if ($transfer->from_user_id === auth()->id()) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'Нельзя принять собственную передачу',
                ]);

                return to_route('garage.index');
            }

            $car = Car::query()->whereKey($transfer->car_id)->lockForUpdate()->firstOrFail();

            if ($car->user_id !== $transfer->from_user_id) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'Ссылка недействительна',
                ]);

                return to_route('garage.index');
            }

            CarOwnership::query()
                ->where('car_id', $car->id)
                ->whereNull('owned_until')
                ->update(['owned_until' => now()]);

            $car->update(['user_id' => auth()->id()]);

            CarOwnership::create([
                'car_id' => $car->id,
                'user_id' => auth()->id(),
                'owned_from' => now(),
                'owned_until' => null,
            ]);

            $transfer->update([
                'status' => CarTransferStatus::Accepted->value,
                'to_user_id' => auth()->id(),
            ]);

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Автомобиль добавлен в ваш гараж 🎉',
            ]);

            return to_route('garage.show', $car);
        });
    }

    public function cancel(Car $car): RedirectResponse
    {
        abort_unless($car->user_id === auth()->id(), 403);

        CarTransfer::query()
            ->where('car_id', $car->id)
            ->where('status', CarTransferStatus::Pending->value)
            ->update(['status' => CarTransferStatus::Cancelled->value]);

        return to_route('garage.show', $car);
    }

    public function regenerate(Car $car): RedirectResponse
    {
        abort_unless($car->user_id === auth()->id(), 403);

        CarTransfer::query()
            ->where('car_id', $car->id)
            ->where('status', CarTransferStatus::Pending->value)
            ->update(['status' => CarTransferStatus::Cancelled->value]);

        return to_route('transfer.create', $car);
    }

    private function firstOrCreatePendingTransfer(Car $car): CarTransfer
    {
        $existing = CarTransfer::query()
            ->where('car_id', $car->id)
            ->where('status', CarTransferStatus::Pending->value)
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        return CarTransfer::create([
            'car_id' => $car->id,
            'from_user_id' => auth()->id(),
            'to_user_id' => null,
            'token' => Str::random(64),
            'status' => CarTransferStatus::Pending->value,
            'expires_at' => now()->addDays(7),
        ]);
    }
}
