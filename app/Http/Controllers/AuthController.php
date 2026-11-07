<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function showForm(){
        return view('auth.register');
    }

    /*
    ========================================================
    PREVIOUS IMPLEMENTATION - KEPT FOR REVIEW
    سبب التعديل:
    1) فحص الحظر كان يتم قبل التحقق من كلمة المرور، فأي شخص يعرف بريد
       مستخدم محظور يستطيع معرفة أن الحساب محظور دون أن يعرف كلمة المرور
       (User Enumeration / تسريب معلومات).
    2) اسم التوكن كان اسم المستخدم، والأوضح أن يدل على مصدر التوكن.
    السلوك الجديد: نتحقق من البريد وكلمة المرور أولًا، ثم نفحص الحظر.
    المستخدم المحظور يحصل على 403 فقط إذا كانت بياناته صحيحة، والتوكن
    لا يُنشأ له إطلاقًا.
    ========================================================
    */
    // public function login(Request $request){
    //     $credentials = $request->validate(['email' => 'required|email',
    //                                       'password'=> 'required'  ]);
    //     $user =User::where('email',$request->email)->first();
    //         if ($user && isset($user->ban_info['is_banned']) && $user->ban_info['is_banned']) {
    //
    //         $banUntil = $user->ban_info['ban_until'] ?? null;
    //
    //         if ($banUntil && now()->greaterThan($banUntil)) {
    //             $user->update([
    //                 'ban_info' => [
    //                 'is_banned' => false,
    //                 'ban_until' => null
    //                 ]
    //             ]);
    //         } else {
    //             return response()->json([
    //                 'message' => 'عذراً حسابك محظور من قبل الإدارة' ], 403);
    //         }
    //     }
    //
    //     if (Auth::attempt($credentials)){
    //         /** @var \App\Models\User $user */
    //         $user = Auth::user();
    //         $token =$user->createToken($user->name)->plainTextToken;
    //         return response()->json(['message'=>'تم تسجيل الدخول',
    //                                   'access_token'=>$token,
    //                                   'token_type'=>'Bearer',
    //                                     'user'=> $user],200);
    //     }
    //     return response()->json(['message'=>'البريد الالكتروني او كلمة السر غير صحيحة'],401);
    // }
    /*
    ========================================================
    UPDATED IMPLEMENTATION
    ========================================================
    */
    public function login(Request $request){
        $credentials = $request->validate(['email' => 'required|email',
                                          'password'=> 'required'  ]);

        // 1) التحقق من البيانات أولًا (validate لا يسجل دخولًا ولا ينشئ جلسة)
        if (!Auth::validate($credentials)) {
            return response()->json(['message'=>'البريد الالكتروني او كلمة السر غير صحيحة'],401);
        }

        /** @var \App\Models\User $user */
        $user = User::where('email', $request->email)->first();

        // 2) فحص الحظر بعد التأكد من أن صاحب الحساب هو من يحاول الدخول
        if (isset($user->ban_info['is_banned']) && $user->ban_info['is_banned']) {
            $banUntil = $user->ban_info['ban_until'] ?? null;

            if ($banUntil && now()->greaterThan($banUntil)) {
                // انتهت مدة الحظر المؤقت: نرفعه تلقائيًا
                $user->update(['ban_info' => ['is_banned' => false, 'ban_until' => null]]);
            } else {
                return response()->json([
                    'message' => 'عذراً حسابك محظور من قبل الإدارة' ], 403);
            }
        }

        // 3) إنشاء التوكن وإرجاع المستخدم مع أدواره حتى تعرف الواجهة صلاحياته
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['message'=>'تم تسجيل الدخول',
                                  'access_token'=>$token,
                                  'token_type'=>'Bearer',
                                  'user'=> $user->load('roles')],200);
    }

    /*
    ========================================================
    PREVIOUS IMPLEMENTATION - KEPT FOR REVIEW
    سبب التعديل:
    1) المستخدم الجديد لم يكن يحصل على أي دور (role)، فيصبح حسابًا بلا
       صلاحيات معروفة. الآن يُعطى الدور "user" تلقائيًا.
    2) Auth::login($user) ينشئ جلسة web لا يحتاجها الـ API لأننا نستخدم
       Bearer Token، فتمت إزالته.
    3) حقل ban_info يُهيأ بنفس القيمة التي تستخدمها الـ Seeders.
    ========================================================
    */
    // public function register(Request $request){
    //     $request->validate(['name' => 'required|string|max:255',
    //                        'email' => 'required|string|email|max:255|unique:users',
    //                        'password' => 'required|string|min:8|confirmed']);
    //     $user = User::create(['name' => $request->name,
    //                          'email' => $request->email,
    //                          'password' => Hash::make($request->password)
    //     ]) ;
    //
    //     Auth::login($user);
    //     $token =$user->createToken($user->name)->plainTextToken;
    //
    //     return response()->json(['message' =>'تم انشاء الحساب',
    //                              'access_token'=>$token,
    //                              'token_type'=>'Bearer',
    //                              'user' =>$user],201);
    // }
    /*
    ========================================================
    UPDATED IMPLEMENTATION
    ========================================================
    */
    public function register(Request $request){
        // ملاحظة: max:100 لأن عمود name في جدول users طوله 100 (كان 255 فيفشل الإدخال في MySQL)
        $request->validate(['name' => 'required|string|max:100',
                           'email' => 'required|string|email|max:255|unique:users',
                           'password' => 'required|string|min:8|confirmed']);
        $user = User::create(['name' => $request->name,
                             'email' => $request->email,
                             'password' => Hash::make($request->password),
                             'ban_info' => ['is_banned' => false, 'ban_until' => null],
        ]) ;

        // إسناد الدور الافتراضي "user" إن كان موجودًا في جدول roles (يُنشأ عبر RoleSeeder)
        $defaultRole = Role::where('code', 'user')->first();
        if ($defaultRole) {
            $user->roles()->attach($defaultRole->id, ['assigned_at' => now()]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['message' =>'تم انشاء الحساب',
                                 'access_token'=>$token,
                                 'token_type'=>'Bearer',
                                 'user' =>$user->load('roles')],201);
    }

    public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message'=>'تم تسجيل الخروج بنجاح'],200);
    }
}
