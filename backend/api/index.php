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

unset($_SERVER['PATH_INFO']);
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__.'/../public/index.php';

require __DIR__.'/../public/index.php';
