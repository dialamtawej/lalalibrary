<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function showForm(){
        return view('auth.register');
    }

    public function login(Request $request){
        $credentials = $request->validate(['email' => 'required|email',
                                          'password'=> 'required'  ]);
        $user =User::where('email',$request->email)->first();
        if ($user && $user->is_banned){
            if($user->ban_until && now()->greaterThan($user->ban_until)){
                $user->update(['is_banned'=>false,
                                 'ban_until'=>null]);
            }
            else{
                return response()->json(['message'=>'عذراً حسابك محظور من قبل الإدارة'],403);
            }
        }                                  

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

    public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message'=>'تم تسجيل الخروج بنجاح'],200);
    }
}
