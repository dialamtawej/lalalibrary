<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminPasswordController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Auth;

Route::post('/register',[AuthController::class,'register']);
Route::post('/login',[AuthController::class,'login']);

Route::middleware('auth:sanctum')->group(function(){
    Route::get('/user', function (Request $request) {
        return $request->user();});
       
    Route::post('/admin/reset-password',[AdminPasswordController::class,'resetPassword']);
    Route::post('/profile/update',[UserController::class,'updateProfile']);
    Route::post('/login',[AuthController::class,'login']);
    Route::post('/logout',[AuthController::class,'logout']);
    Route::get('/users',[UserController::class,'displayusers']);
    Route::post('/users/{id}/ban',[UserController::class,'banUser']);


});
  