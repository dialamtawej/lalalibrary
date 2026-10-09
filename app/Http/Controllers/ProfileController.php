<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
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
}}
