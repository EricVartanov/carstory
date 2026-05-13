<?php

use App\Models\User;
use App\Services\Images\ImageTranscoder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('temp upload requires auth', function () {
    $this->postJson('/api/upload/temp', [])->assertStatus(401);
});

test('authenticated user can upload temp image and receive jpg url', function () {
    Storage::fake('public');

    app()->bind(ImageTranscoder::class, fn () => new class implements ImageTranscoder
    {
        public function toJpeg(UploadedFile $file, int $quality = 85): UploadedFile
        {
            return UploadedFile::fake()->image('converted.jpg', 100, 100);
        }
    });

    $user = User::factory()->create();

    $file = UploadedFile::fake()->create('avatar.heic', 200, 'image/heic');

    $response = $this
        ->actingAs($user)
        ->post(route('upload.temp'), ['file' => $file], ['Accept' => 'application/json']);

    $response->assertOk()->assertJsonStructure(['temp_path', 'url']);

    $tempPath = (string) $response->json('temp_path');
    $url = (string) $response->json('url');

    expect($tempPath)->toStartWith('temp/')->and($tempPath)->toEndWith('.jpg');
    expect($url)->toBe('/storage/'.$tempPath);

    Storage::disk('public')->assertExists($tempPath);
});

test('delete temp rejects path outside temp folder', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->deleteJson(route('upload.delete-temp'), ['temp_path' => 'avatars/x.jpg'])
        ->assertStatus(422);
});

test('authenticated user can delete temp image', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    Storage::disk('public')->put('temp/x.jpg', 'jpeg');
    Storage::disk('public')->assertExists('temp/x.jpg');

    $this
        ->actingAs($user)
        ->deleteJson(route('upload.delete-temp'), ['temp_path' => 'temp/x.jpg'])
        ->assertOk()
        ->assertJson(['ok' => true]);

    Storage::disk('public')->assertMissing('temp/x.jpg');
});

