<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'superadmin' => \App\Http\Middleware\EnsureSuperAdmin::class,
            'store.access' => \App\Http\Middleware\EnsureStoreAccess::class,
            'approved' => \App\Http\Middleware\EnsureApproved::class,
            'store.license' => \App\Http\Middleware\EnsureStoreLicense::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
