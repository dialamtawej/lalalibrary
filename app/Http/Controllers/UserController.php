<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon\Carbon;

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
                             'hours'=>'required_if:type,temporary|nullable|integer|min:1', ]);
         $user= User::find($id);
         if(!$user){
            return response()->json(['message'=>'المستخدم غير موجود'],404);
         }
         if ($request->type==='permanent'){
            $user->update(['is_banned'=>true,
                            'ban_until'=>null,]);
                $message='تم حظر المستخدم بشكل دائم بنجاح';
         }
         else{
            $hours=(int) $request->hours;
            $banUntil= \Carbon\Carbon::now()->addHours($hours);
            $user->update(['is_banned'=>true,
                            'ban_until'=>$banUntil,]);
                $message="تم حظر المستخدم  لمدة {$hours}ساعة بنجاح";            
         }
         return response()->json(['message'=>$message,
                                     'user'=>$user],200);
    }
}
