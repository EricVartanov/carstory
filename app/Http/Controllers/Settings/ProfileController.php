<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Car;
use App\Models\CarOwnership;
use App\Models\Entry;
use App\Services\Images\ImageUploadNormalizer;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        private readonly ImageUploadNormalizer $imageUploadNormalizer,
    ) {
    }

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/profile', [
            'user' => $user,
            'stats' => [
                'total_cars' => Car::query()->where('user_id', $user->id)->withoutTrashed()->count(),
                'previous_cars' => CarOwnership::query()->where('user_id', $user->id)
                    ->whereNotNull('owned_until')
                    ->count(),
                'total_entries' => Entry::query()->where('user_id', $user->id)->count(),
            ],
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Update the user's avatar image only.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => [
                'required',
                'file',
                'max:2048',
                'mimetypes:image/jpeg,image/png,image/webp,image/gif,image/bmp,image/heic,image/heif,image/heic-sequence,image/heif-sequence',
            ],
        ]);

        $user = $request->user();

        try {
            $normalized = $this->imageUploadNormalizer->normalize($request->file('avatar'));
        } catch (\Throwable $e) {
            throw ValidationException::withMessages([
                'avatar' => 'Не удалось обработать изображение. Попробуйте выбрать другое фото.',
            ]);
        }

        $path = Storage::disk('public')->putFile('avatars', $normalized);

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->forceFill(['avatar' => $path])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Фото обновлено.']);

        return back();
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
