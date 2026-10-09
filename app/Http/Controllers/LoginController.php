<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function login(Request $request){
        $credentials = $request->validate(['email' => 'required|email',
                                          'password'=> 'required'  ]);

        if (Auth::attempt($credentials)){
            /** @var \App\Models\User $user */
            $user = Auth::user();
            $token =$user->createToken($user->name)->plainTextToken;
            return response()->json(['message'=>'تم تسجيل الدخول',
                                      'access_token'=>$token,
                                      'token_type'=>'Bearer',
                                        'user'=> $user],200);
        }  
        return response()->json(['message'=>'البريد الالكتروني او كلمة السر غير صحيحة'],401);                                
    }
}
