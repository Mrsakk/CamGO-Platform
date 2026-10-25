<?php

$storagePath = getenv('LARAVEL_STORAGE_PATH') ?: '/tmp/storage';

if (! is_dir($storagePath)) {
    mkdir($storagePath, 0777, true);
}

foreach ([
    'app/private',
    'app/public',
    'framework/cache/data',
    'framework/sessions',
    'framework/views',
    'logs',
] as $directory) {
    $path = $storagePath.'/'.$directory;

    if (! is_dir($path)) {
        mkdir($path, 0777, true);
    }
}

$runtimePaths = [
    'LARAVEL_STORAGE_PATH' => $storagePath,
    'APP_CONFIG_CACHE' => '/tmp/cache/config.php',
    'APP_EVENTS_CACHE' => '/tmp/cache/events.php',
    'APP_PACKAGES_CACHE' => '/tmp/cache/packages.php',
    'APP_ROUTES_CACHE' => '/tmp/cache/routes.php',
    'APP_SERVICES_CACHE' => '/tmp/cache/services.php',
    'VIEW_COMPILED_PATH' => $storagePath.'/framework/views',
];

if (! is_dir('/tmp/cache')) {
    mkdir('/tmp/cache', 0777, true);
}

foreach ($runtimePaths as $key => $value) {
    if (getenv($key) === false || getenv($key) === '') {
        putenv($key.'='.$value);
    }

    if (! isset($_ENV[$key]) || $_ENV[$key] === '') {
        $_ENV[$key] = $value;
    }

    if (! isset($_SERVER[$key]) || $_SERVER[$key] === '') {
        $_SERVER[$key] = $value;
    }
}

if ((isset($_SERVER['HTTP_X_DEBUG_TRACE']) && $_SERVER['HTTP_X_DEBUG_TRACE'] === 'camgo-debug') || (isset($_GET['debug_trace']) && $_GET['debug_trace'] === 'camgo-debug')) {
    putenv('APP_DEBUG=true');
    $_ENV['APP_DEBUG'] = 'true';
    $_SERVER['APP_DEBUG'] = 'true';
}

unset($_SERVER['PATH_INFO']);
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__.'/../public/index.php';

try {
    require __DIR__.'/../public/index.php';
} catch (\Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => array_slice(explode("\n", $e->getTraceAsString()), 0, 10),
    ]);
}

