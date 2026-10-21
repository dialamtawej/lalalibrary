<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user(); 
        $request->validate([
            'name'                  => 'sometimes|string|max:255',
            'old_password'          => 'required_with:password|current_password',
            'password'              => 'nullable|string|min:8|confirmed',
            'image'                 => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);  
        if ($request->has('name')) {
            $user->name = $request->name; }   
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password); }   
        if ($request->hasFile('image')) {
               
             if ($user->image && Storage::disk('public')->exists($user->image)) {
                    Storage::disk('public')->delete($user->image); }
    
                $imagePath = $request->file('image')->store('profiles', 'public');
                $user->image = $imagePath;  }   
                
                $user->save();

                return response()->json([
                    'message' => 'تم تحديث بيانات الملف الشخصي بنجاح',
                    'user'    => $user
                ], 200);     
}
    public function displayusers(){
        $users = User::select('id','name','email',)->get();
        return response()->json(['message'=>'نم جلب جميع المستخدمين بنجاح',
                                  'users'=> $users],200);
    }

    public function banUser(Request $request,$id){
        $request->validate(['type'=>'required|in:permanent,temporary',
                             'ban_until'=>'required_if:type,temporary|nullable|date|after:now', ]);
         $user= User::find($id);
         if(!$user){
            return response()->json(['message'=>'المستخدم غير موجود'],404);
         }
        $banData=[
            'is_banned'=>true,
            'ban_until'=>$request->type==='permanent'? null : $request->ban_until,
        ];

            $user->update(['ban_info'=> $banData]);
            $message = $request->type === 'permanent'
            ? 'تم حظر المستخدم بشكل دائم بنجاح'
            : "تم حظر المستخدم مؤقتاً حتى تاريخ: {$request->ban_until}";

         return response()->json(['message'=>$message,
                                     'user'=>$user],200);
    }

    public function showUser($id){
        $user = User::with(['profile','roles'])->find($id);
        if(!$user){
            return response()->json(['message'=>'المستخدم غير موجود '], 404);
        }
        return response()->json(['message'=>'تم جلب تفاصيل المستخدم بنجاح ','user'=>$user],200);
    }

    public function updateUser(Request $request, $id){
        $user = User::find($id);
        if(!$user){
            return response()->json(['message'=>'المستخدم غير موجود '], 404);
        }
        $request->validate([
            'name'                  => 'sometimes|string|max:255',
            'email'                 => 'sometimes|email|unique:user,email,'. $id,]);
        if($request->has('name')){$user->name = $request->name;}
        if($request->has('email')){$user->email = $request->email;}
           $user->save();
           return response()->json(['message'=>'تم تعديل بيانات المستخدم بنجاح ','user'=>$user],200);

    }

    public function deleteUser($id){
        $user = User::find($id);
        if(!$user){
            return response()->json(['message'=>'المستخدم غير موجود '], 404);
        }
        if (Auth :: id() == $user->id){
            return response()->json(['message' => 'لا يمكنك حذف حسابك الشخصي المسؤول من هنا'],403);
        }
        $user->delete();
        return response()->json(['message'=>'تم حذف  المستخدم نهائياً بنجاح '  ],200);

    }

    public function updateRoles(Request $request, $id){
        $user =User::find($id);
        if(!$user){
            return response()->json(['message'=>'المستخدم غير موجود '], 404);
        }
        $request->validate(['role' => 'required|array',
                             'roles.*' => 'exists:roles,id']);
        $user->roles()->sync($request->roles);
        $user->load('roles');     
        return response()->json(['message'=>'تم تحديث أدوار و صلاحيات المستخدم بنجاح ','user'=>$user],200);
                
    }
}
