<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Передача автомобиля</title>
</head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
    <p>Пользователь {{ $transfer->fromUser->email }} передаёт вам автомобиль
        {{ $transfer->car->brand }} {{ $transfer->car->model }} {{ $transfer->car->year }}.</p>

    <p>Перейдите по ссылке чтобы принять передачу:</p>
    <p><a href="{{ $transferUrl }}">{{ $transferUrl }}</a></p>

    @if($transfer->expires_at)
        <p>Ссылка действительна до {{ $transfer->expires_at->format('d.m.Y') }}</p>
    @endif

    <p>Если у вас нет аккаунта — зарегистрируйтесь по этой же ссылке.</p>
</body>
</html>
