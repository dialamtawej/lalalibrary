<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminPasswordController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BookController;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\CategoryController;

Route::post('/register',[AuthController::class,'register']);
Route::post('/login',[AuthController::class,'login']);
//مستخدم نشط
Route::middleware('user.active')->group(function(){
    Route::get('/user', function(Request $request){
        return $request->user(); });
    Route::post('/profile/update', [UserController::class,'updateProfile']);
    Route::post('/logout',[AuthController::class,'logout']);
    Route::get('/categories',[CategoryController::class,'index']);    
});
//ادمن
Route::middleware('admin.access')->group(function () {

    Route::post('/admin/reset-password', [AdminPasswordController::class,'resetPassword']);
    Route::get('/users', [UserController::class, 'displayusers']);
    Route::get('/users/{id}', [UserController::class, 'showUser']);
    Route::patch('/users/{id}', [UserController::class, 'updateUser']);
    Route::post('/users/{id}/ban', [UserController::class, 'banUser']);
    Route::delete('/users/{id}', [UserController::class, 'deleteUser']);
    Route::put('/users/{id}/roles', [UserController::class, 'updateRoles']);
    Route::get('/books',[BookController::class, 'index']);
    Route::post('/books',[BookController::class, 'store']);
    Route::post('/books/{id}',[BookController::class, 'updateBook']);



});
  