<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\Entry;
use App\Models\EntryPhoto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class EntryController extends Controller
{
    public function store(Request $request, Car $car): RedirectResponse
    {
        abort_unless(auth()->id() === $car->user_id, 403);

        $validated = $request->validate([
            'date' => ['required', 'date'],
            'mileage' => ['nullable', 'integer', 'min:0'],
            'type' => ['required', Rule::in(['note', 'service', 'trip', 'fuel'])],
            'title' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', Rule::in(['RUB', 'AMD', 'KZT', 'UAH', 'BYN', 'USD'])],
            'photos.*' => ['nullable', 'image', 'max:10240'],
        ]);

        $entry = Entry::create([
            'car_id' => $car->id,
            'user_id' => $request->user()->id,
            'date' => $validated['date'],
            'mileage' => $validated['mileage'] ?? null,
            'type' => $validated['type'],
            'title' => $validated['title'] ?? null,
            'body' => $validated['body'] ?? null,
            'amount' => $validated['amount'] ?? null,
            'currency' => $validated['currency'] ?? null,
        ]);

        /** @var array<int, UploadedFile> $photos */
        $photos = $request->file('photos', []);

        foreach (array_values($photos) as $index => $photo) {
            $path = $photo->store("entries/{$entry->id}", 'public');

            EntryPhoto::create([
                'entry_id' => $entry->id,
                'path' => $path,
                'original_name' => $photo->getClientOriginalName(),
                'order' => $index,
            ]);
        }

        return to_route('garage.show', $car);
    }

    public function update(Request $request, Car $car, Entry $entry): RedirectResponse
    {
        abort_unless(auth()->id() === $car->user_id, 403);

        abort_unless($entry->car_id === $car->id, 404);

        abort_unless($entry->user_id === auth()->id(), 403, 'Нельзя изменять записи предыдущего владельца');

        $validated = $request->validate([
            'date' => ['required', 'date'],
            'mileage' => ['nullable', 'integer', 'min:0'],
            'type' => ['required', Rule::in(['note', 'service', 'trip', 'fuel'])],
            'title' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', Rule::in(['RUB', 'AMD', 'KZT', 'UAH', 'BYN', 'USD'])],
            'photos.*' => ['nullable', 'image', 'max:10240'],
        ]);

        $entry->update([
            'date' => $validated['date'],
            'mileage' => $validated['mileage'] ?? null,
            'type' => $validated['type'],
            'title' => $validated['title'] ?? null,
            'body' => $validated['body'] ?? null,
            'amount' => $validated['amount'] ?? null,
            'currency' => $validated['currency'] ?? null,
        ]);

        return to_route('garage.show', $car);
    }

    public function destroy(Car $car, Entry $entry): RedirectResponse
    {
        abort_unless(auth()->id() === $car->user_id, 403);

        abort_unless($entry->car_id === $car->id, 404);

        abort_unless($entry->user_id === auth()->id(), 403, 'Нельзя изменять записи предыдущего владельца');

        $photos = $entry->photos()->get(['id', 'path']);

        foreach ($photos as $photo) {
            if ($photo->path) {
                Storage::disk('public')->delete($photo->path);
            }
        }

        $entry->photos()->delete();
        $entry->delete();

        return to_route('garage.show', $car);
    }
}
