<?php

test('inertia root document includes pwa meta tags and apple touch icons', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertSee('name="theme-color"', false);
    $response->assertSee('content="#18181b"', false);
    $response->assertSee('name="mobile-web-app-capable"', false);
    $response->assertSee('name="apple-mobile-web-app-capable"', false);
    $response->assertSee('name="apple-mobile-web-app-title"', false);
    $response->assertSee('content="CaRStory"', false);
    $response->assertSee('href="/icons/icon-192.png"', false);
    $response->assertSee('href="/icons/icon-152.png"', false);
    $response->assertSee('href="/icons/icon-144.png"', false);
});
