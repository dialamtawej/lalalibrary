<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
// ملاحظة مراجعة: تمت إزالة السطر التالي لأن هذا الـ namespace غير موجود في Laravel
// (المسار الصحيح هو Illuminate\Support\Carbon)، ولم يكن مستخدمًا في الملف:
// use Illuminate\Support\Carbon\Carbon;

class UserController extends Controller
{
    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user(); 
        $request->validate([
            // ملاحظة مراجعة: max:100 بدل 255 لأن عمود name طوله 100 في جدول users
            'name'                  => 'sometimes|string|max:100',
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
    /*
    ========================================================
    PREVIOUS IMPLEMENTATION - KEPT FOR REVIEW
    سبب التعديل: كانت تجلب كل المستخدمين دفعة واحدة (مع آلاف المستخدمين يصبح
    الطلب بطيئًا وثقيلًا)، وبدون بحث، وبدون الأدوار وحالة الحظر التي تحتاجها
    لوحة التحكم.
    التغييرات:
      - Pagination (per_page: 1..50، الافتراضي 15)
      - search: بحث في الاسم والبريد
      - status: all | active | banned
      - إرجاع roles و ban_info و image و created_at
    تنبيه: المفتاح users أصبح كائن Pagination ({ data, current_page, last_page, ... })
    بدل مصفوفة مباشرة.
    ========================================================
    */
    // public function displayusers(){
    //     $users = User::select('id','name','email',)->get();
    //     return response()->json(['message'=>'نم جلب جميع المستخدمين بنجاح',
    //                               'users'=> $users],200);
    // }
    /*
    ========================================================
    UPDATED IMPLEMENTATION
    ========================================================
    */
    public function displayusers(Request $request){
        $request->validate(['search'   => 'nullable|string|max:100',
                            'status'   => 'nullable|in:all,active,banned',
                            'per_page' => 'nullable|integer|min:1|max:50']);

        $query = User::select('id','name','email','image','ban_info','created_at')->with('roles:id,name,code');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
            });
        }

        // ban_info عمود JSON، نقرأ المفتاح is_banned منه بصيغة column->key
        if ($request->input('status') === 'banned') {
            $query->where('ban_info->is_banned', true);
        } elseif ($request->input('status') === 'active') {
            $query->where(function ($q) {
                $q->whereNull('ban_info')->orWhere('ban_info->is_banned', false);
            });
        }

        $users = $query->latest()->orderByDesc('id')
                       ->paginate($request->integer('per_page', 15))->withQueryString();

        return response()->json(['message'=>'تم جلب جميع المستخدمين بنجاح',
                                  'users'=> $users],200);
    }

    /*
    ========================================================
    ADDED - رفع الحظر
    POST /users/{id}/unban
    كان يمكن حظر المستخدم لكن لا توجد طريقة لرفع الحظر الدائم.
    ========================================================
    */
    public function unbanUser($id){
        $user = User::find($id);
        if(!$user){
            return response()->json(['message'=>'المستخدم غير موجود'],404);
        }
        $user->update(['ban_info' => ['is_banned' => false, 'ban_until' => null]]);
        return response()->json(['message'=>'تم رفع الحظر عن المستخدم بنجاح', 'user'=>$user],200);
    }

    public function banUser(Request $request,$id){
        $request->validate(['type'=>'required|in:permanent,temporary',
                             'ban_until'=>'required_if:type,temporary|nullable|date|after:now', ]);
         $user= User::find($id);
         if(!$user){
            return response()->json(['message'=>'المستخدم غير موجود'],404);
         }
        /*
        ========================================================
        ADDED CHECK - مراجعة
        سبب الإضافة: لم يكن هناك ما يمنع الأدمن من حظر نفسه، وعندها يفقد
        الوصول إلى لوحة التحكم فورًا (CheckBanned يحذف توكنه في الطلب التالي).
        نفس الفكرة المطبقة مسبقًا في deleteUser.
        ========================================================
        */
        if (Auth::id() == $user->id) {
            return response()->json(['message' => 'لا يمكنك حظر حسابك الشخصي'], 403);
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
        /*
        ========================================================
        PREVIOUS IMPLEMENTATION - KEPT FOR REVIEW
        سبب التعديل: قاعدة unique كانت تشير إلى جدول اسمه "user" وهو غير موجود
        (اسم الجدول "users")، فأي طلب يحتوي على email كان ينتهي بخطأ 500
        من قاعدة البيانات بدل أن يعمل. أيضًا name حده 100 حسب عمود الجدول.
        ========================================================
        */
        // $request->validate([
        //     'name'                  => 'sometimes|string|max:255',
        //     'email'                 => 'sometimes|email|unique:user,email,'. $id,]);
        /*
        ========================================================
        UPDATED IMPLEMENTATION
        ========================================================
        */
        $request->validate([
            'name'                  => 'sometimes|string|max:100',
            'email'                 => 'sometimes|email|max:255|unique:users,email,'. $user->id,]);
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
        // ملاحظة مراجعة: الموديل User يستخدم SoftDeletes، لذلك الحذف هنا "ناعم"
        // (يُملأ deleted_at ولا يُحذف السجل). الرسالة السابقة كانت تقول "نهائياً":
        // return response()->json(['message'=>'تم حذف  المستخدم نهائياً بنجاح '  ],200);
        // تنبيه للتطوير اللاحق: البريد يبقى محجوزًا بسبب unique، ولم تُحذف توكنات المستخدم.
        $user->tokens()->delete(); // إبطال جلسات المستخدم المحذوف حتى لا يبقى توكنه صالحًا
        return response()->json(['message'=>'تم حذف المستخدم بنجاح'],200);

    }

    /*
    ========================================================
    PREVIOUS IMPLEMENTATION - KEPT FOR REVIEW
    سبب التعديل: الـ Validation كان يتحقق من حقل اسمه "role" بينما الكود
    يستخدم "roles":
      - إذا أرسلت الواجهة roles فقط  -> يفشل الطلب دائمًا (role مطلوب).
      - إذا أرسلت role               -> $request->roles تكون null، و sync(null)
        تعني sync([]) فتُحذف كل أدوار المستخدم، بما فيها دور الأدمن.
    أُضيفت أيضًا حماية تمنع الأدمن من سحب دور الأدمن من نفسه (حتى لا يقفل
    النظام على نفسه)، وتسجيل وقت الإسناد في assigned_at.
    ========================================================
    */
    // public function updateRoles(Request $request, $id){
    //     $user =User::find($id);
    //     if(!$user){
    //         return response()->json(['message'=>'المستخدم غير موجود '], 404);
    //     }
    //     $request->validate(['role' => 'required|array',
    //                          'roles.*' => 'exists:roles,id']);
    //     $user->roles()->sync($request->roles);
    //     $user->load('roles');
    //     return response()->json(['message'=>'تم تحديث أدوار و صلاحيات المستخدم بنجاح ','user'=>$user],200);
    // }
    /*
    ========================================================
    UPDATED IMPLEMENTATION
    Body المتوقع: { "roles": [1, 2] }  (أرقام الأدوار من جدول roles)
    ========================================================
    */
    public function updateRoles(Request $request, $id){
        $user =User::find($id);
        if(!$user){
            return response()->json(['message'=>'المستخدم غير موجود '], 404);
        }
        $validated = $request->validate(['roles' => 'required|array|min:1',
                                         'roles.*' => 'integer|distinct|exists:roles,id']);

        $roleIds = $validated['roles'];

        if (Auth::id() == $user->id) {
            $adminRoleId = \App\Models\Role::where('code', 'admin')->value('id');
            if ($adminRoleId && !in_array($adminRoleId, $roleIds)) {
                return response()->json(['message' => 'لا يمكنك إزالة صلاحية المدير عن حسابك الشخصي'], 403);
            }
        }

        // نحتفظ بتاريخ الإسناد الأصلي للأدوار الموجودة، ونسجل now() للجديدة فقط
        $currentIds = $user->roles()->pluck('roles.id')->all();
        $syncData = [];
        foreach ($roleIds as $roleId) {
            $syncData[$roleId] = in_array($roleId, $currentIds) ? [] : ['assigned_at' => now()];
        }
        $user->roles()->sync($syncData);

        $user->load('roles');
        return response()->json(['message'=>'تم تحديث أدوار و صلاحيات المستخدم بنجاح ','user'=>$user],200);
                
    }
}
