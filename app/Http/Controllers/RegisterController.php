<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class RegisterController extends Controller
{
    public function showForm(){
        return view('auth.register');
    }

    public function register(Request $request){
        $request->validate(['name' => 'required|string|max:255',
                           'email' => 'required|string|email|max:255|unique:users',
                           'password' => 'required|string|min:8|confirmed']);
        $user = User::create(['name' => $request->name,
                             'email' => $request->email,
                             'password' => Hash::make($request->password)
        ]) ;
        
        Auth::login($user);
        $token =$user->createToken($user->name)->plainTextToken;

        return response()->json(['message' =>'تم انشاء الحساب',
                                 'access_token'=>$token,
                                 'token_type'=>'Bearer',
                                 'user' =>$user],201);
    }
}
