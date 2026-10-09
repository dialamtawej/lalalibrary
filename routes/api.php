<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\AdminPasswordController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::post('/register',[RegisterController::class,'register']);
Route::post('/login',[LoginController::class,'login']);
Route::post('/admin/reset-password',[AdminPasswordController::class,'resetPassword']);
Route::middleware('auth:sanctum')->group(function(){
    Route::post('/admin/reset-password',[AdminPasswordController::class,'resetPassword']);
});