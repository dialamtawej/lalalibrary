<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminPasswordController extends Controller
{
    public function resetPassword(Request $request){
         $request->validate(['email' =>'required|email|exists:users,email',
                            'password'=>'required|string|min:8|confirmed' ]);
         $user = User::where('email',$request->email)->first();
         $user->password= Hash::make($request->password);
         $user->save();
  return response()->json(['message'=>'تم تغيير كلمة سر المستخدم بنجاح',
             'user'=>['id'=> $user->id,
                      'name'=>$user->name,
                      'email'=>$user->email] ],200);
    }
}
