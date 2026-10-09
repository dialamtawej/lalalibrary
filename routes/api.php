<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\AdminPasswordController;
use App\Http\Controllers\ProfileController;




Route::post('/register',[RegisterController::class,'register']);
Route::post('/login',[LoginController::class,'login']);

Route::middleware('auth:sanctum')->group(function(){
    Route::get('/user', function (Request $request) {
        return $request->user();});
        
    Route::post('/admin/reset-password',[AdminPasswordController::class,'resetPassword']);
    Route::post('/profile/update',[ProfileController::class,'updateProfile']);
});
  