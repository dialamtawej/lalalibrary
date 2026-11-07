<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminPasswordController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BookController;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\RoleController;

/*
========================================================
PREVIOUS IMPLEMENTATION - KEPT FOR REVIEW
سبب التعديل: لا يوجد حد لعدد محاولات الدخول/التسجيل، مما يسمح بتخمين
كلمات المرور (Brute Force). أُضيف throttle:6,1 = ست محاولات في الدقيقة لكل IP.
========================================================
*/
// Route::post('/register',[AuthController::class,'register']);
// Route::post('/login',[AuthController::class,'login']);
/*
========================================================
UPDATED IMPLEMENTATION
========================================================
*/
Route::middleware('throttle:6,1')->group(function () {
    Route::post('/register',[AuthController::class,'register']);
    Route::post('/login',[AuthController::class,'login']);
});
/*
========================================================
ADDED - مسارات عامة (بدون تسجيل دخول)
الدراسة: الزائر يتصفح الكتب ويبحث فيها ويشاهد التفاصيل والتصنيفات.
========================================================
*/
Route::get('/books',[BookController::class, 'index']);
Route::get('/books/{slug}',[BookController::class, 'show']);
Route::get('/categories',[CategoryController::class,'index']);

//مستخدم نشط
Route::middleware('user.active')->group(function(){
    // ملاحظة مراجعة: كان يرجع $request->user() بدون الأدوار، فلا تستطيع الواجهة
    // معرفة إن كان المستخدم أدمن لتعرض له لوحة التحكم. أصبح يرجع roles أيضًا.
    // Route::get('/user', function(Request $request){
    //     return $request->user(); });
    Route::get('/user', function(Request $request){
        return $request->user()->load('roles'); });
    Route::post('/profile/update', [UserController::class,'updateProfile']);
    Route::post('/logout',[AuthController::class,'logout']);
    // ملاحظة مراجعة: نُقل إلى المسارات العامة بالأعلى
    // Route::get('/categories',[CategoryController::class,'index']);
});
//ادمن
Route::middleware('admin.access')->group(function () {

    Route::post('/admin/reset-password', [AdminPasswordController::class,'resetPassword']);
    Route::get('/users', [UserController::class, 'displayusers']);
    Route::get('/users/{id}', [UserController::class, 'showUser']);
    Route::patch('/users/{id}', [UserController::class, 'updateUser']);
    Route::post('/users/{id}/ban', [UserController::class, 'banUser']);
    Route::post('/users/{id}/unban', [UserController::class, 'unbanUser']); // ADDED
    Route::delete('/users/{id}', [UserController::class, 'deleteUser']);
    Route::put('/users/{id}/roles', [UserController::class, 'updateRoles']);
    Route::get('/roles', [RoleController::class, 'index']); // ADDED

    // ملاحظة مراجعة: GET /books أصبح عامًا (بالأعلى). للأدمن نفس القائمة على /admin/books
    // Route::get('/books',[BookController::class, 'index']);
    Route::get('/admin/books',[BookController::class, 'index']); // ADDED
    Route::post('/books',[BookController::class, 'store']);
    Route::post('/books/{id}',[BookController::class, 'updateBook']);
    Route::delete('/books/{id}',[BookController::class, 'destroy']); // ADDED

    // ADDED - إدارة التصنيفات
    Route::get('/admin/categories', [CategoryController::class, 'adminIndex']);
    Route::post('/admin/categories', [CategoryController::class, 'store']);
    Route::patch('/admin/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/admin/categories/{id}', [CategoryController::class, 'destroy']);
});
