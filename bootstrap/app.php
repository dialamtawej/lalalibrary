<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\CheckAdmin;
use App\Http\Middleware\CheckBanned;
use Illuminate\Http\Request;


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
        /*
        ========================================================
        ADDED - مراجعة
        سبب الإضافة: إذا أرسلت الواجهة طلبًا لمسار محمي بدون توكن ولم تضع
        الهيدر Accept: application/json، يحاول Laravel تحويلها إلى route('login')
        وهو غير موجود في المشروع، فينتهي الطلب بخطأ 500 بدل 401.
        الآن كل أخطاء مسارات api/* (401, 403, 404, 422, 500...) ترجع JSON دائمًا.
        ========================================================
        */
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });
    })->create();
