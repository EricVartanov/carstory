<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <script>
            (function () {
                const carstory = localStorage.getItem('carstory-theme');
                const appearance = localStorage.getItem('appearance');
                let dark = true;

                if (carstory === 'light' || carstory === 'dark') {
                    dark = carstory === 'dark';
                } else if (appearance === 'light') {
                    dark = false;
                } else if (appearance === 'dark') {
                    dark = true;
                } else if (appearance === 'system') {
                    dark = window.matchMedia(
                        '(prefers-color-scheme: dark)',
                    ).matches;
                } else {
                    dark = true;
                }

                document.documentElement.classList.toggle('dark', dark);
                document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
            })();
        </script>

        <style>
            html {
                background-color: hsl(220 20% 97%);
            }

            html.dark {
                background-color: hsl(222 25% 5%);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        {{-- PWA --}}
        <meta name="theme-color" content="#18181b">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="CaRStory">
        <link rel="apple-touch-icon" href="/icons/icon-192.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144.png">
        @if (file_exists(public_path('build/manifest.webmanifest')))
            <link rel="manifest" href="{{ asset('build/manifest.webmanifest') }}">
        @endif

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
