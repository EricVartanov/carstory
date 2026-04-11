<?php

test('inertia root document loads inter font and client theme bootstrap', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertSee('fonts.googleapis.com/css2?family=Inter', false);
    $response->assertSee('carstory-theme', false);
});
