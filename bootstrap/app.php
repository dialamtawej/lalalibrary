<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\CheckAdmin;
use App\Http\Middleware\CheckBanned;


return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->group('user.active', [
            'auth:sanctum',
            CheckBanned::class, // فحص الحظر مباشرة
        ]);
    
        // جروب الأدمن (أدمن + غير محظور + صلاحيات أدمن)
        $middleware->group('admin.access', [
            'auth:sanctum',
            CheckBanned::class,
            CheckAdmin::class,
        ]);
    })
        
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
